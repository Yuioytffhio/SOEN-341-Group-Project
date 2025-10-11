import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import HomePageNavBar from "./pages/HomePageNavBar.jsx";
// Public pages
import HomePage from "./pages/HomePage.jsx"; // Landing page
import LoginPage from "./pages/LoginPage.jsx";
// Student pages
import StudentHomePage from "./pages/student/HomePageStudent/HomePage";
import EventDiscovery from "./pages/student/EventDiscovery/EventDiscovery";
import MyEvents from "./pages/student/MyEvents/MyEvents";
import AboutUs from "./pages/student/AboutUs/AboutUs";
import ProfilePage from "./pages/student/ProfilePage/ProfilePage";
import Navbar from "./components/navbar/Navbar";                 // for logged-in users



function AppContent() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const location = useLocation();

  // Public pages use HomePageNavBar
  const isPublicPage =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {/* Navbar switcher */}
      {isPublicPage ? <HomePageNavBar /> : isLoggedIn && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected (requires login) */}
        <Route
          path="/home"
          element={isLoggedIn ? <StudentHomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/discovery"
          element={isLoggedIn ? <EventDiscovery /> : <Navigate to="/login" />}
        />
        <Route
          path="/myevents"
          element={isLoggedIn ? <MyEvents /> : <Navigate to="/login" />}
        />
        <Route
          path="/aboutus"
          element={isLoggedIn ? <AboutUs /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
      <AppContent />
  );
}
