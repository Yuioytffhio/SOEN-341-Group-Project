import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "./HomePageStudent.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function StudentHomePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Student";

  const eventImages = [
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "https://images.unsplash.com/photo-1515169067865-5387ec356754",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
  };

  return (
    <div className="student-home-container">
      <header className="student-header">
        <h2>Welcome back, {userName}!</h2>
      </header>

      <div className="student-main-content">
        <div className="top-section">
          <h1>Welcome to your page</h1>
          <p>You can start browsing exciting campus events right away.</p>
          <button className="discover-btn" onClick={() => navigate("/discovery")}>
            Discover Events
          </button>
        </div>

        <div className="bottom-section">
          <Slider {...settings}>
            {eventImages.map((src, index) => (
              <div key={index} className="carousel-slide">
                <img src={src} alt={`Event ${index + 1}`} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}
