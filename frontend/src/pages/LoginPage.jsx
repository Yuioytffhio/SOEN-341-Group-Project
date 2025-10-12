import React, { useState } from "react";
import "../styles/LoginPage.css";
import login_background from "../assets/login_Background.jpg";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No profile found for this email.");
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

  
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("email", userData.email);
    localStorage.setItem("userName", userData.firstName || "");
    localStorage.setItem("role", userData.role || "");
    localStorage.setItem("customID", userDoc.id); // ✅ e.g., st_000001

    if (userData.role === "student") navigate("/studentHome");
    else if (userData.role === "organizer") navigate("/orgHome");
    else if (userData.role === "administrator") navigate("/adminHome");

  } catch (error) {
    console.error("Login failed:", error.message);
    setError("Invalid email or password.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="login-page"
      style={{ background: `url(${login_background}) no-repeat center center / cover` }}
    >
      <div className="form-container-wrapper">
        <div className="form-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="extra-links">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signuppage")}>Sign up</span>
          </p>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
