const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: String, default: '' },
  rating: { type: Number, default: 4 },
  ratingCount: { type: Number, default: 0 },
  brand: { type: String, default: '' },
  size: { type: String, default: '' },
  colour: { type: String, default: '' },
  pattern: { type: String, default: '' },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
