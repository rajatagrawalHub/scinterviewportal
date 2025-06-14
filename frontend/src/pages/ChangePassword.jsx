import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
    }
  }, []);

  const handleChangePassword = async () => {
    try {
      await axios.post(
        "/api/user/change-password",
        form,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      alert("Password changed successfully");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to change password");
    }
  };

  return (
    <div className="change-container">
      <div className="change-card">
        <h2 className="change-title">Change Password</h2>

        <label htmlFor="oldPassword" className="change-label">
          Current Password
        </label>
        <input
          type="password"
          id="oldPassword"
          className="change-input"
          placeholder="Enter current password"
          onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        />

        <label htmlFor="newPassword" className="change-label">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          className="change-input"
          placeholder="Enter new password"
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />

        <button className="change-button" onClick={handleChangePassword}>
          Update Password
        </button>

        <div className="change-links">
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          <button onClick={() => navigate("/logout")}>Logout</button>
        </div>
      </div>
    </div>
  );
}
