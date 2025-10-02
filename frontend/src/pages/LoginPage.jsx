import React from "react";
import "../styles/LoginPage.css";
import logo from "../logo.png";
import login_background from "../login_page_background1.jpeg";

export default function LoginPage() {
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
          <form>
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
            <a href="#">Forgot password?</a> | <a href="#">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
