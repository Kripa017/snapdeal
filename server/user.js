const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const UserModel = require("./models/Users");


const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const router = express.Router();


let transporter;
const transporterInitPromise = (async () => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.warn('EMAIL_USER / EMAIL_PASS not set; using Ethereal test account');
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
    }

    await transporter.verify();
    const transportName = process.env.EMAIL_USER ? 'Gmail' : 'Ethereal';
    console.log(`${transportName} transporter is ready to send emails`);
  } catch (err) {
    console.error('Failed to initialize email transporter:', err);
    transporter = null;
  }
})();

const SEND_EMAIL = process.env.SEND_EMAIL === 'true';




router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const phoneDigits = (phone || "").replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 10) {
      return res.status(400).json({ success: false, error: "Phone must be exactly 10 digits" });
    }

    const existing = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: (name || "").trim(),
      email: email.trim().toLowerCase(),
      phone: phoneDigits || "",
      password: hashed,
    });

    const { password: _, ...safe } = user.toObject();
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ success: true, user: safe, token });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body || {};

    if (!password) {
      return res.status(400).json({ success: false, error: "Password required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ success: false, error: "Email or phone required" });
    }

    const phoneDigits = (phone || "").replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 10) {
      return res.status(400).json({ success: false, error: "Phone must be exactly 10 digits" });
    }

    const query = email
      ? { email: email.trim().toLowerCase() }
      : { phone: phoneDigits };

    const user = await UserModel.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email/phone or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, error: "Invalid email/phone or password" });
    }

    const { password: _, ...safe } = user.toObject();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ success: true, user: safe, token });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



// Send OTP endpoint
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Email required" });
    }

    let user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    
    
    if (!user) {
      user = await UserModel.create({
        name: "",
        email: email.trim().toLowerCase(),
        phone: "",
        password: "", // No password for OTP login
      });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    
    await UserModel.findByIdAndUpdate(user._id, {
      otpHash,
      otpExpiresAt
    });

    await transporterInitPromise;
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const fromAddress = process.env.EMAIL_USER || 'test@example.com';
    const recipientEmail = email.trim().toLowerCase();

    const mailOptions = {
      from: `"Snapdeal" <${fromAddress}>`,
      to: recipientEmail,
      subject: 'Your OTP for Login',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP sent to:', mailOptions.to);
    console.log('Message ID:', info.messageId);
    if (transporter.options.host === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error('Send OTP error:', err);
    const message = err && err.message ? err.message : "Failed to send OTP";
    return res.status(500).json({ success: false, error: message });
  }
});


router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and OTP required" });
    }

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, error: "OTP not requested" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, error: "OTP expired" });
    }

    const isValidOtp = await bcrypt.compare(otp, user.otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    
    await UserModel.findByIdAndUpdate(user._id, {
      otpHash: "",
      otpExpiresAt: null
    });

    const { password, otpHash, otpExpiresAt, ...safe } = user.toObject();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ success: true, user: safe, token });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Email required" });
    }

    let user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    
    
    if (!user) {
      user = await UserModel.create({
        name: "",
        email: email.trim().toLowerCase(),
        phone: "",
        password: "", 
      });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    
    await UserModel.findByIdAndUpdate(user._id, {
      otpHash,
      otpExpiresAt
    });

    await transporterInitPromise;
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const fromAddress = process.env.EMAIL_USER || 'test@example.com';
    const recipientEmail = email.trim().toLowerCase();

    const mailOptions = {
      from: `"Snapdeal" <${fromAddress}>`,
      to: recipientEmail,
      subject: 'Your OTP for Login (Resent)',
      text: `Your new OTP is: ${otp}. It expires in 10 minutes.\n\nEmail: ${recipientEmail}`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP resent to:', mailOptions.to);
    console.log('Message ID:', info.messageId);
    if (transporter.options.host === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return res.json({ success: true, message: "OTP resent to your email" });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ success: false, error: "Failed to resend OTP" });
  }
});


function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, error: "No authorization header" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ success: false, error: "Malformed authorization header" });
  }
  const token = parts[1];
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    const user = await UserModel.findById(decoded.id, { password: 0 });
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    req.user = user;
    next();
  });
}


router.get("/users", authenticate, async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get("/users/me", authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;