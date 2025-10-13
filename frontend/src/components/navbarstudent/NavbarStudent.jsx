import React, { useState } from "react";
import { useNavigate , Link} from "react-router-dom";
import "./NavbarStudent.css";
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
        <li><Link to="/studentHome">Home</Link></li>
        <li><Link to="/discovery">Discovery</Link></li>
        <li><Link to="/myevents">My Events</Link></li>
        <li><Link to="/aboutus">About Us</Link></li>
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
