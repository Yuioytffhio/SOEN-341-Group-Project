import React from "react";
import "../styles/HomePage.css";
import HomePageNavBar from "./HomePageNavBar.jsx";
import { useNavigate } from "react-router-dom";
//import background from "../assets/people_happy_on_campus3.jpg";
import background from "../assets/background.jpg";

export default function HomePage() {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate("/LoginPage"); 
  };

  return (
    <div className="home-page">
        <HomePageNavBar />
      <div
        className="container"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 222, 179, 0.01), rgba(66, 33, 33, 0.4)), url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "right",
          backgroundRepeat: "space",
        }}
      >
        
        <div className="content">
          <div className="blur-box">
            <h1>Welcome to the SOEN 341 Campus Events Platform</h1>
            <p><em>Discover, organize and attend campus events, all in one place.</em></p>

            <p><strong>- Students</strong> can explore upcoming events, claim free or paid tickets, and check in using QR codes.</p>
            <p><strong>- Organizers</strong> can easily create andmanage events, monitor attendance, and access analytics</p>
            <p><strong>- Administrators</strong> ensure smooth and safe event experiences for everyone on campus.</p>

            <p><strong>Join your campus community today!</strong></p>
            <button className="login-button" onClick={handleOnClick}>Login</button>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
