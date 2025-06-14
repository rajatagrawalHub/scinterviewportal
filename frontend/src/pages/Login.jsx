import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/user/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Please log in to continue</p>

        <label htmlFor="username" className="login-label">Username</label>
        <input
          type="text"
          id="username"
          className="login-input"
          placeholder="Enter your username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <label htmlFor="password" className="login-label">Password</label>
        <input
          type="password"
          id="password"
          className="login-input"
          placeholder="Enter your password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="login-button" onClick={handleLogin}>Log In</button>
      </div>
    </div>
  );
}
