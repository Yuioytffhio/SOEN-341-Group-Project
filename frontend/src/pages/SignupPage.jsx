import React, { useState } from "react";
import "../styles/SignUpPage.css"; 
import login_background from "../assets/login_Background.jpg";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, setDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateNextID = async (rolePrefix) => {
    try {
      const usersRef = collection(db, "users");
      const roleName = rolePrefix === "st" ? "student" : rolePrefix === "ad" ? "administrator" : "organizer";
      const q = query(usersRef, where("role", "==", roleName), orderBy("__name__", "desc"), limit(1));
      const snapshot = await getDocs(q);

      let newIDNumber = 1;
      if (!snapshot.empty) {
        const lastID = snapshot.docs[0].id;
        const lastNumber = parseInt(lastID.split("_")[1], 10);
        newIDNumber = lastNumber + 1;
      }

      return `${rolePrefix}_${String(newIDNumber).padStart(6, "0")}`;
    } catch (err) {
      console.error("Error generating ID:", err);
      return `${rolePrefix}_000001`;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const auth = getAuth();

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      const prefix = role === "student" ? "st" : role === "organizer" ? "og" : "ad";
      const newID = await generateNextID(prefix);

      await setDoc(doc(db, "users", newID), {
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        profilePic: null,
        uid: auth.currentUser.uid,
      });

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("email", email);
      localStorage.setItem("userName", firstName);
      localStorage.setItem("role", role);
      localStorage.setItem("customID", newID);

      if (role === "student") navigate("/studentHome");
      else if (role === "organizer") navigate("/orgHome");
      else navigate("/adminHome");

    } catch (err) {
      console.error("Signup failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-page"
      style={{ background: `url(${login_background}) no-repeat center center / cover` }}
    >
      <div className="form-container-wrapper">
        <div className="form-container">
          <h1>Sign Up</h1>
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

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

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <p className="extra-links">
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
