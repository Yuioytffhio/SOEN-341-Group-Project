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
    <div className='homepage-navbar'>
      <div className='homepage-navbar-left-section'>
        {/*
        <img src={logo} alt="Logo" className='logo' />
        */}
        <ul className='homepage-navbar-title'>
            <li><Link to='/' className='homepage-navbar-appName'>SOEN 341</Link></li>
        </ul>
      </div>

      <div className='homepage-navbar-div'>
        <ul className='homepage-navbar-content'>
            <li><Link to="/publicaboutus" className="public-aboutus-nav-link">About Us</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default HomePageNavBar;
