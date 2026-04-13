require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const multer = require("multer");

const userRoutes = require("./user");
const productRoutes = require("./products");
const ordersRoutes = require("./orders");

const app = express();
app.use(cors());
app.use(express.json());




app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const ImageSchema = new mongoose.Schema({
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model("Image", ImageSchema);


const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const newImage = new Image({ imageUrl });
    await newImage.save();

    res.json({ success: true, image: newImage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.delete("/images/:id", async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/snapdeal";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", ordersRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
