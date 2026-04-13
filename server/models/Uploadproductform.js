const productSchema = new mongoose.Schema({
  product: String,
  category: String,
  quantity: Number,
  description: String,
  price: Number,
  image: String,
}, { timestamps: true });