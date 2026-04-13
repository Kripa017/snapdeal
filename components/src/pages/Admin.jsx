import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    
    const STATIC_USER = "Kripa";
    const STATIC_PASS = "kripa@12";

    if (username === STATIC_USER && password === STATIC_PASS) {
      console.log("Admin login successful");
    } else {
      console.log("Admin login attempt with invalid credentials");
    }

    navigate("/admindashboard");
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Admin Login</h1>

      <form>
        <div>
          <label>Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="button" className="primary-btn" onClick={handleContinue}>
          Continue
        </button>
      </form>
    </div>
    </div>
  );
}
export default Admin;

