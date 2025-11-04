import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "./HomePageAdmin.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePageBackground2 from "../../../assets/homepage_caroussel2.jpg";
import HomePageBackground3 from "../../../assets/homepage_caroussel3.jpg";

export default function StudentHomePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Administrator";

  const eventImages = [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2400&q=100",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2400&q=100",
    HomePageBackground3,
    HomePageBackground2
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
  };

  return (
    <div className="admin-home-container">
      <header className="admin-header">
        <h2 className="greetings">Welcome back, {userName}!</h2>
      </header>

      <div className="carousel-section">
        <Slider {...settings}>
          {eventImages.map((src, index) => (
            <div key={index} className="carousel-slide">
              <img src={src} alt={`Event ${index + 1}`} />
            </div>
          ))}
        </Slider>

        <div className="overlay">
          <p>You can managing your events right away.</p>
          <button
            className="oversight-btn"
            onClick={() => navigate("/oversightAdmin")}
          >
            See Events
          </button>
        </div>
      </div>
    </div>
  );
}
