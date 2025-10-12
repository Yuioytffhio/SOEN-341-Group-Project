import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import profileIcon from "../../assets/profile_icon.png";

export default function Navbar() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <ul>
        <li>
          <a onClick={() => navigate("/discovery")}>Events</a>
        </li>
        <li>
          <a onClick={() => navigate("/myevents")}>My Events</a>
        </li>
        <li>
          <a onClick={() => navigate("/aboutus")}>About</a>
        </li>

        {/* Profile Icon with Dropdown */}
        <li
          className="profile-icon"
          onMouseEnter={() => setDropdownVisible(true)}
          onMouseLeave={() => setDropdownVisible(false)}
        >
          <img src={profileIcon} alt="Profile" />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/profile")}>View Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}
