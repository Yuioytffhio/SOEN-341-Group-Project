import React, { useState } from "react";
import { useNavigate , Link} from "react-router-dom";
import "./NavBarOrg.css";
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
        <li><Link to="/orgHome">Home</Link></li>
        <li><Link to="/eventcreation">Event Creation</Link></li>
        <li><Link to="/analyticsorg">Analytics</Link></li>
        <li><Link to="/toolsorg">Tools</Link></li>
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
