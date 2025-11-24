import React from "react";
import "../styles/AboutUs.css";
import background from "../assets/homepageBackground1.jpg";

const AboutUs = () => {
  return (
    <div className="aboutus-page" style={{
              backgroundImage: `linear-gradient(rgba(255, 222, 179, 0.01), rgba(66, 33, 33, 0.4)), url(${background})`,
              backgroundSize: "cover",
              backgroundPosition: "right",
              backgroundRepeat: "space",
            }}>
      <header className="aboutus-header">
        <h2 className="aboutus-greetings">About Us</h2>
      </header>

      <div className="aboutus-content">
        <p>
          Welcome to our campus ticketing event platform, designed by Concordia University software and computer engineering students.
        </p>

        <p>
          Our mission is to make it easier for students, organizers, and administrators to browse through different events on campus. Discover, manage, and host events all in one place. Whether you're looking to join a club activity, attend a talk, or promote your own event, CampusConnect helps you stay engaged with everything happening around you.
        </p>

        <p>This project was developed as part of the SOEN 341 course.</p>

        <h3>Our Team</h3>
        <div className="aboutus-team-section">
          <p>Nadine Seba,</p>
          <p>Raphael Procopi,</p>
          <p>Hiba Talbi,</p>
          <p>Marc Espin,</p>
          <p>Lojaine Matar,</p>
          <p>Patel Shyam,</p>
          <p>Siam Manwar Pranto,</p>
          <p>Thomas Sullivan</p>
        </div>

        <h3>Technologies Used</h3>
        <div className="aboutus-tech-section">
          <p>React</p>
          <p>Firebase</p>
          <p>Node.js</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
