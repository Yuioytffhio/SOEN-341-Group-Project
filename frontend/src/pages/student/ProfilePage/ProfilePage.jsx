import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const userId = localStorage.getItem("customID");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [userId]);

  const isValidPhone = (phone) => {
    const phoneRegex =
      /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);

    if (value && !isValidPhone(value)) {
      setPhoneError("Invalid phone number format.");
    } else {
      setPhoneError("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User not logged in or missing userId!");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "users", userId), {
        firstName,
        lastName,
        email, // cannot be edited
        phone,
      });

      alert("Profile saved successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(`Error: ${error.code || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="information-section">
        <h2>Information</h2>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="name-row">
            <label>
              First Name:
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!editing}
              />
            </label>

            <label>
              Last Name:
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!editing}
              />
            </label>
          </div>

          <label>
            Email (cannot be changed):
            <input
              type="email"
              value={email}
              disabled
              className="disabled-input"
            />
          </label>

          <label>
            Phone:
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              disabled={!editing}
              placeholder="123-456-7890"
            />
          </label>

          {editing && phoneError && (
            <p className="warning-text">{phoneError}</p>
          )}

          <div className="button-container">
            {editing && (
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            )}

            {!editing && (
              <button
                type="button"
                className="edit-btn"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
