import '../styles/HomePageNavBar.css';
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

const HomePageNavBar = () => {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate("/AboutUs"); 
  };

  return (
    <div className='homepagenavbar'>
      <div className='left-section'>
        <img src={logo} alt="Logo" className='logo' />
        <h2 className='appName'>SOEN 341</h2>
      </div>

      <div className='navbar-div'>
        <ul className='navbar-content'>
            <li><Link to="/AboutUs" className="nav-link">About Us</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default HomePageNavBar;
