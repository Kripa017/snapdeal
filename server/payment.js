const Razorpay = require("razorpay");
const OrderModel = require('./models/order');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = "rzp_test_SbJLOUMQxW8ARb";
const RAZORPAY_KEY_SECRET = "q9TncX1jP0hQe3J2sdlsvtlp";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});


const createOrder = async (amount, currency = 'INR') => {
  try {
    const options = {
      amount: amount * 100, 
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};


const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    return expectedSign === razorpaySignature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  razorpay
};