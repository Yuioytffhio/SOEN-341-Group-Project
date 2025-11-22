import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PublicAboutUs.css";

const AboutUs = () => {
  return (
    <div className="public-aboutus-page">
      <header className="public-aboutus-header">
        <h2 className="public-aboutus-greetings">About us</h2>
      </header>

       <div className="public-aboutus-content">
        <p>
          Welcome to our campus ticketing event platform, designed by Concordia University software and computer engineering students.
        </p>

        <p>
          Our mission is to make it easier for students, organizers, and administrators to browser through the different events available on campus.
          discover, manage, and host events all in one place. Whether you're looking to join a club activity, attend a talk, or promote your own event, CampusConnect helps you stay engaged with everything happening around you.
        </p>

        <p>
          This project was developed as part of the SOEN 341 course. 
        </p>
        
        <h3>Our Team</h3>
        <p>Nadine Seba  Raphael Procopi Hiba Talbi  Marc Espin  Lojaine Matar   Patel Shyam Siam Manwar Pranto  Thomas Sullivan</p>

        <h3>Technologies Used</h3>
        <p>React, Firebase, Node.js.</p>

        <div className="public-aboutus-team-section">
          
        </div>

        <div className="public-aboutus-tech-section">
          
        </div>
      </div>
    </div>
  );
};

export default AboutUs;