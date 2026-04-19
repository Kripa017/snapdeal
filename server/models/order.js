const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'order confirmed', 'shipped', 'delivered', 'paid'];

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi', 'netbanking'], default: 'cod' },
  cardInfo: {
    cardNumber: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    cvv: { type: String },
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
