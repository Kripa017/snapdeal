const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('./models/Product');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/products', async (req, res) => {
  try {
    const raw = req.query.category;
    if (raw && String(raw).trim()) {
      const cat = String(raw).trim();
      const products = await Product.find({
        category: new RegExp(`^${escapeRegex(cat)}$`, 'i'),
      });
      return res.json(products);
    }
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


function parseNum(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

router.post('/products', upload.single('image'), async (req, res) => {
  const price = parseNum(req.body.price, 0);
  const mrpRaw = parseNum(req.body.mrp, NaN);
  const product = new Product({
    product: req.body.product,
    category: req.body.category,
    quantity: parseNum(req.body.quantity, 0),
    description: req.body.description || '',
    price,
    mrp: Number.isFinite(mrpRaw) ? mrpRaw : price,
    discount: req.body.discount || '',
    rating: parseNum(req.body.rating, 4),
    ratingCount: parseNum(req.body.ratingCount, 0),
    brand: req.body.brand || '',
    size: req.body.size || '',
    colour: req.body.colour || '',
    pattern: req.body.pattern || '',
    image: req.file ? req.file.filename : '',
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.put('/products/:id', async (req, res) => {
  try {
    const price = parseNum(req.body.price, 0);
    const mrpRaw = parseNum(req.body.mrp, NaN);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        product: req.body.product,
        category: req.body.category,
        quantity: parseNum(req.body.quantity, 0),
        description: req.body.description || '',
        price,
        mrp: Number.isFinite(mrpRaw) ? mrpRaw : price,
        discount: req.body.discount || '',
        rating: parseNum(req.body.rating, 4),
        ratingCount: parseNum(req.body.ratingCount, 0),
        brand: req.body.brand || '',
        size: req.body.size || '',
        colour: req.body.colour || '',
        pattern: req.body.pattern || '',
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.put('/products/:id/upload', upload.single('image'), async (req, res) => {
  try {
    const price = parseNum(req.body.price, 0);
    const mrpRaw = parseNum(req.body.mrp, NaN);
    const updateData = {
      product: req.body.product,
      category: req.body.category,
      quantity: parseNum(req.body.quantity, 0),
      description: req.body.description || '',
      price,
      mrp: Number.isFinite(mrpRaw) ? mrpRaw : price,
      discount: req.body.discount || '',
      rating: parseNum(req.body.rating, 4),
      ratingCount: parseNum(req.body.ratingCount, 0),
      brand: req.body.brand || '',
      size: req.body.size || '',
      colour: req.body.colour || '',
      pattern: req.body.pattern || '',
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
