import React from "react";
import "../styles/LoginPage.css";
import logo from "../assets/logo.png";
import login_background from "../assets/login_page_background1.jpeg";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // prevent the form from reloading the page

    // Simulate a successful login (temporary for development)
    localStorage.setItem("loggedIn", "true");

    // Redirect to student homepage
    navigate("/home");
  };

  return (
    <div
      className="login-page"
      style={{ 
        background: `url(${login_background}) no-repeat center center / cover` 
      }}
    >
      <div className="form-container-wrapper">
        {/* Logo and Project Name side by side */}
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <h2 className="appName">SOEN 341</h2>
        </div>

        {/* Login Form */}
        <div className="form-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" />
            </div>
            <button type="submit" className="btn">Login</button>
          </form>
          <p className="extra-links">
            <a href="#">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
