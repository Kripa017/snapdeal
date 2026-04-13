const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  password: { type: String, default: "" }, // Optional for OTP login
  otpHash: { type: String, default: "" },
  otpExpiresAt: { type: Date, default: null },
}, { timestamps: true });

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
