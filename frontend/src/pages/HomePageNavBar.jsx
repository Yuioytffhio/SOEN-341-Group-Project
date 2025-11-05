import React, { useState } from "react";
import { useNavigate , Link} from "react-router-dom";
import '../styles/HomePageNavBar.css';
import logo from "../assets/logo1.webp";

const HomePageNavBar = () => {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate("/AboutUs"); 
  };

  return (
    <div className='homepagenavbar'>
      <div className='left-section'>
        {/*
        <img src={logo} alt="Logo" className='logo' />
        */}
        <ul className='navbar-title'>
            <li><Link to='/' className='appName'>SOEN 341</Link></li>
        </ul>
      </div>

      <div className='navbar-div'>
        <ul className='navbar-content'>
            <li><Link to="/publicaboutus" className="nav-link">About Us</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default HomePageNavBar;
