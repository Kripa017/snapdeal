import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import { getFullApiPath } from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter email");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(getFullApiPath("/api/send-otp"), {
        email: email.trim(),
      });

      if (res.data.success) {
        setOtpSent(true);
        setError("");
      } else {
        setError(res.data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Enter OTP");
      return;
    }
    setError("");
    setLoading(true);

    try {
      console.log("Verifying OTP for email:", email.trim(), "OTP:", otp.trim());
      const res = await axios.post(getFullApiPath("/api/verify-otp"), {
        email: email.trim(),
        otp: otp.trim(),
      });
      console.log("Verify OTP response:", res.data);

      if (res.data.success) {
        console.log("OTP verified successfully, token:", res.data.token);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        console.log("Navigating to dashboard...");
        navigate("/dashboard");
      } else {
        setError(res.data.error || "Failed to verify OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.error || err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(getFullApiPath("/api/resend-otp"), {
        email: email.trim(),
      });

      if (res.data.success) {
        setError("");
      } else {
        setError(res.data.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>

        {error && <p className="error-msg">{error}</p>}

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            
          </form>
        )}

        <p>Don&apos;t have an account?</p>

        <Link to="/">
          <button type="button" className="secondary-btn">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Login;
