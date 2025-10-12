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
      // 1️⃣ Try Firebase Auth login first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Fetch Firestore profile by UID
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (!docSnap.exists()) throw new Error("No profile found for this user.");

      const userData = docSnap.data();

      // Save login state
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("email", userData.email);
      localStorage.setItem("userName", userData.firstName || "");
      localStorage.setItem("role", userData.role || "");

      // Navigate depending on role
      if (userData.role === "student") navigate("/studentHome");
      else if (userData.role === "organizer") navigate("/orgHome");
      else if (userData.role === "administrator") navigate("/adminHome");

    } catch (authError) {
      console.log("Firebase Auth login failed:", authError.message);

      // 3️⃣ Fallback to Firestore login for old users
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();

          // Optionally: check password field in Firestore if you had one
          // (temporary for old users; Firebase Auth is preferred)
          // if (userData.password !== password) throw new Error("Invalid password");

          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("email", userData.email);
          localStorage.setItem("userName", userData.firstName || "");
          localStorage.setItem("role", userData.role || "");

          // Navigate depending on role
          if (userData.role === "student") navigate("/studentHome");
          else if (userData.role === "organizer") navigate("/orgHome");
          else if (userData.role === "administrator") navigate("/adminHome");

        } else {
          setError("User not found. Please sign up first.");
        }
      } catch (firestoreError) {
        console.error("Firestore fallback login failed:", firestoreError.message);
        setError("Login failed. Please try again.");
      }
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
