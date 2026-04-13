const express = require('express');
const OrderModel = require('./models/order');
const { createOrder, verifyPayment } = require('./payment');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

const ORDER_STATUSES = ['pending', 'order confirmed', 'shipped', 'delivered', 'paid'];


let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn('EMAIL_USER / EMAIL_PASS not set; using Ethereal test account for orders');
  
  (async () => {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      transporter.verify((err, success) => {
        if (err) console.error('Ethereal transporter verify failed:', err);
        else console.log('Ethereal transporter is ready for orders');
      });
    } catch (err) {
      console.error('Failed to create Ethereal transporter for orders:', err);
    }
  })();
}

if (transporter) {
  transporter.verify((err, success) => {
    if (err) {
      console.error('Gmail transporter verify failed for orders:', err);
    } else {
      console.log('Gmail transporter is ready to send order emails');
    }
  });
}

router.post('/orders', async (req, res) => {
  try {
    const { customer, paymentMethod, cardInfo, items, total } = req.body;

    if (!customer || !customer.firstName || !customer.lastName || !customer.address || !customer.city || !customer.state || !customer.zip || !customer.email || !customer.phone) {
      return res.status(400).json({ success: false, error: 'All customer fields are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart items are required' });
    }

    let orderData = {
      customer,
      paymentMethod,
      items,
      total,
      status: paymentMethod === 'cod' ? 'pending' : 'pending'
    };

    // For Razorpay gateway payments, create Razorpay order
    if (paymentMethod !== 'cod') {
      const razorpayOrder = await createOrder(total);
      orderData.razorpayOrderId = razorpayOrder.id;
      orderData.paymentStatus = 'pending';
    } else {
      if (cardInfo) {
        orderData.cardInfo = cardInfo;
      }
    }

    const order = await OrderModel.create(orderData);

    if (paymentMethod !== 'cod') {
      return res.json({
        success: true,
        order,
        razorpayOrder: {
          id: order.razorpayOrderId,
          amount: total * 100,
          currency: 'INR',
          key: "rzp_test_SbJLOUMQxW8ARb"
        }
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed: ${ORDER_STATUSES.join(', ')}`,
      });
    }

    
    const oldOrder = await OrderModel.findById(req.params.id);
    if (!oldOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    
    const notificationStatuses = ['order confirmed', 'shipped', 'delivered'];
    if (notificationStatuses.includes(status) && oldOrder.status !== status) {
      try {
        const fromAddress = process.env.EMAIL_USER || 'test@example.com';
        const recipientEmail = order.customer.email;

        const mailOptions = {
          from: '"Snapdeal" <your_admin_email@gmail.com>',
          to: recipientEmail,
          subject: `Order Status Update - ${status.toUpperCase()}`,
          text: `Order Status Update:

Order ID: ${order._id}
Customer: ${order.customer.firstName} ${order.customer.lastName}
Email: ${order.customer.email}
Phone: ${order.customer.phone}

Status Changed To: ${status.toUpperCase()}

Order Details:
${order.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`).join('\n')}

Total: ₹${order.total}

Date: ${new Date().toLocaleString()}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Order status email sent to: ${recipientEmail}`);
        console.log('Message ID:', info.messageId);
        if (transporter.options.host === 'smtp.ethereal.email') {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      } catch (emailErr) {
        console.error('Failed to send order status email:', emailErr);
        
      }
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    console.log('Payment verification request:', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    });

    // Verify payment signature
    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    console.log('Payment signature verification result:', isValid);

    if (!isValid) {
      console.log('Payment verification failed: invalid signature');
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Update order with payment details and mark as paid
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId,
        paymentStatus: 'paid',
        status: 'paid'
      },
      { new: true }
    );

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    console.log('Order updated successfully:', order._id);
    res.json({ success: true, order });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/payment-callback', async (req, res) => {
  try {
    console.log('Payment callback received:', req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.query;

    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      // Verify payment signature
      const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

      console.log('Callback payment verification result:', isValid);

      if (isValid) {
        // Extract order ID from razorpay_order_id (remove 'order_' prefix)
        const orderId = razorpay_order_id.replace('order_', '');

        // Update order with payment details
        const order = await OrderModel.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id },
          {
            razorpayPaymentId: razorpay_payment_id,
            paymentStatus: 'paid',
            status: 'paid'
          },
          { new: true }
        );

        if (order) {
          console.log('Order updated via callback:', order._id);
          res.redirect('http://localhost:5174/dashboard?payment=success');
        } else {
          console.log('Order not found for callback');
          res.redirect('http://localhost:5174/dashboard?payment=failed');
        }
      } else {
        console.log('Callback payment verification failed');
        res.redirect('http://localhost:5174/dashboard?payment=failed');
      }
    } else {
      res.redirect('http://localhost:5174/dashboard?payment=failed');
    }
  } catch (err) {
    console.error('Payment callback error:', err);
    res.redirect('http://localhost:5174/dashboard?payment=failed');
  }
});

module.exports = router;
