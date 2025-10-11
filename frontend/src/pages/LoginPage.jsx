import React, {useState} from "react";
import "../styles/LoginPage.css";
import logo from "../assets/logo.png";
import login_background from "../assets/login_Background.jpg";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig"; // Firestore instance
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  //const [password, setPassword] = useState("");
  const [role, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent the form from reloading the page
    setError("");
    setLoading(true);

    // Simulate a successful login (temporary for development)
    //localStorage.setItem("loggedIn", "true");

    try {
      //const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if(!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("email", userData.email);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("role", userData.role);

        
        //alert(`Welcome back, ${userData.firstName}!`); // for debug only

        // redirect to the appropriate home page depending on the type of user
        if (userData.role === "student") navigate("/studentHome");
        else if (userData.role === "organizer") navigate("/orgHome");
        else if (userData.role === "administrator") navigate("/adminHome");
        else {
          setError("User not found!");
        }

      } else {
        setError("User not found. Please try again.");
      }


    } catch (e) {
      console.log("Login failed:", e.code, e.message);
      setError("Invalid email. Please Try again.");
    } finally {
      setLoading(false);
    }
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
          {/*
          <img src={logo} alt="Logo" className="logo" />
          <h2 className="appName">SOEN 341</h2>
          */}
        </div>

        {/* Login Form */}
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

            {/*
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" />
            </div>
            */}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="extra-links">
            <p>Don't have an account? <a href="#">Sign up</a></p>
          </p>
        </div>
      </div>
    </div>
  );
}
