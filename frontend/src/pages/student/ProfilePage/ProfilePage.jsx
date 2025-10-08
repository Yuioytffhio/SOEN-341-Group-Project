import React, { useState } from "react";
import "./ProfilePage.css";
import profileIcon from "../../../assets/profile_icon.png";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(profileIcon);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
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
        <form className="profile-form">
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
        </form>
      </div>
    </div>
  );
}
