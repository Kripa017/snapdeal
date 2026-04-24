import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./otpmodal.css";
import { getFullApiPath } from "../api";

function OTPModal({ email, onClose }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    storedUser = {};
  }
  const otpEmail =
    email || location.state?.email || storedUser?.email || "";

  const handleVerify = async () => {
    if (!otpEmail) {
      setError("Email not found. Please login again.");
      return;
    }

    const normalizedOtp = otp.trim();
    if (!normalizedOtp) {
      setError("Please enter OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(getFullApiPath("/api/verify-otp"), {
        email: otpEmail,
        otp: normalizedOtp,
      });

      if (res.data.success) {
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        navigate("/dashboard");
      } else {
        setError(res.data.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!otpEmail) {
      setError("Email not found. Please login again.");
      return;
    }

    try {
      await axios.post(getFullApiPath("/api/resend-otp"), { email: otpEmail });
      alert("OTP Resent");
    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="overlay">
      <div className="modal">

        <div className="header">
          <h2>Sign Up On Snapdeal</h2>
          <span
            className="close"
            onClick={onClose || (() => navigate("/login"))}
          >
            &times;
          </span>
        </div>

        <div className="content">
          <div className="icon">🔒</div>

          <p>Please enter verification code (OTP) sent to:</p>
          <p className="email">{otpEmail}</p>

          {error && <p className="error">{error}</p>}

          <input
            type="text"
            placeholder="Enter OTP"
            className="otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <button className="resend" onClick={handleResend}>
            Resend OTP
          </button>

          <button
            className="continue-btn"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "CONTINUE"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default OTPModal;