import { Link } from "react-router-dom";
import './Navbar.css';
import profileIcon from '../../assets/profile_icon.png';

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src="" alt="" className="logo" />
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/discovery">Discovery</Link></li>
        <li><Link to="/myevents">My Events</Link></li>
        <li><Link to="/aboutus">About Us</Link></li>
        <li className="profile-icon">
          <Link to="/profile">
            <img src={profileIcon} alt="Profile" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
