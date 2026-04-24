import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.css";
import { getFullApiPath } from "../api";



function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone && phone.length !== 10) {
      setError("Phone must be exactly 10 digits");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(getFullApiPath("/api/signup"), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      if (res.data.success) {
        navigate("/login");
      } else {
        setError(res.data.error || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
    <div className="register-container">
      <h2>Register</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Phone</label>
        <div className="phone-input-wrapper">
          <span className="phone-prefix">+91</span>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={10}
            inputMode="numeric"
          />
        </div>

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>Already have an account?</p>

      <Link to="/login">
        <button type="button" className="secondary-btn">
          Login
        </button>
      </Link>
    </div>
    </div>
  );
}

export default Register;
