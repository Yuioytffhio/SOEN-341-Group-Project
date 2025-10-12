import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { db } from "../../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
          console.log("Fetched user data:", data);

          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phoneNumber ? String(data.phoneNumber) : "");
        } else {
          console.log("No such document for ID:", userId);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [userId]);

  const isValidPhone = (value) => {
    const phoneRegex =
      /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(value);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

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
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};

      console.log("Saving data:", { firstName, lastName, email, phoneNumber });

      await setDoc(
        userRef,
        {
          ...existingData,
          firstName,
          lastName,
          email, // cannot be edited directly
          phoneNumber, // ✅ updates correctly
        },
        { merge: true }
      );

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
            Phone Number:
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={!editing}
            />
          </label>

          {editing && phoneError && (
            <p className="warning-text">{phoneError}</p>
          )}

          <div className="button-container">
            {/* ✅ Edit button - only toggles edit mode */}
            {!editing && (
              <button
                type="button"
                className="edit-btn"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}

            {/* ✅ Save button - only appears during edit mode */}
            {editing && (
              <button
                type="submit"
                className="save-btn"
                disabled={loading || phoneError}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
