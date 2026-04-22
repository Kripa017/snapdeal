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



// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Model for Images
const ImageSchema = new mongoose.Schema({
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model("Image", ImageSchema);

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Image upload API
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageBaseUrl = process.env.IMAGE_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${imageBaseUrl}/uploads/${req.file.filename}`;

    const newImage = new Image({ imageUrl });
    await newImage.save();

    res.json({ success: true, image: newImage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all images
app.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete image
app.delete("/images/:id", async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "snapdeal";
if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing. Please set your MongoDB Atlas connection string.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { dbName: MONGODB_DB_NAME })
  .then(() => {
    console.log(`MongoDB Atlas connected (db: ${mongoose.connection.name})`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", ordersRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
