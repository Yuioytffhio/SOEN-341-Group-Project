import React, { useState } from "react";
import "./ProfilePage.css";
import profileIcon from "../../../assets/profile_icon.png";

// Firebase imports
import { db, storage } from "../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
console.log("Firestore instance:", db);

export default function ProfilePage() {
  // State variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(profileIcon);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
//must change this **
  const userId = "st_000001";

  const handlePicChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProfilePic(URL.createObjectURL(selectedFile)); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User not logged in or userId missing!");
      return;
    }

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email before saving!");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = profilePic;

      if (file) {
        const storageRef = ref(storage, `profilePictures/${userId}_${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, "users", userId), {
        firstName,
        lastName,
        email,
        phone,
        profilePic: imageUrl,
      });

      alert(" Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error.code, error.message, error);
      alert(`Error: ${error.code || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <input type="file" onChange={handlePicChange} />
      </div>

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
              />
            </label>

            <label>
              Last Name:
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </div>

          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Phone:
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
