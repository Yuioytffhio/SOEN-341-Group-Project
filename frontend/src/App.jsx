import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import HomePageNavBar from "./pages/HomePageNavBar.jsx";
// Public pages
import HomePage from "./pages/HomePage.jsx"; // Landing page
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";

import Navbar from "./components/navbar/Navbar";                 // for logged-in users
// Student pages
import StudentHomePage from "./pages/student/HomePageStudent/HomePage";
import EventDiscovery from "./pages/student/EventDiscovery/EventDiscovery";
import MyEvents from "./pages/student/MyEvents/MyEvents";
import AboutUs from "./pages/student/AboutUs/AboutUs";
import ProfilePage from "./pages/student/ProfilePage/ProfilePage";
// Organizer Pages 
import OrgrHomePage from "./pages/organizer/HomePageOrg/HomePage.jsx";
import OrgProfilePage from "./pages/organizer/ProfilePage/ProfilePage.jsx";
// Administrator Pages
import AdminHomePage from "./pages/administrator/HomePageAdmin/HomePage.jsx";



function AppContent() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const location = useLocation();

  // Public pages use HomePageNavBar
  const isPublicPage =
    location.pathname === "/" || location.pathname === "/login" || location.pathname == "/signuppage";

  return (
    <>
      {/* Navbar switcher */}
      {isPublicPage ? <HomePageNavBar /> : isLoggedIn && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signuppage" element={<SignUpPage />} />

        {/* Protected (requires login) */}

        {/* Student routes */}
        <Route
          path="/studentHome"
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

        {/* Org Routes */}
        <Route
          path="/orgHome"
          element={isLoggedIn ? <OrgrHomePage /> : <Navigate to="/login" />}
        />
        {/* Admin Routes */}
        <Route
          path="/adminHome"
          element={isLoggedIn ? <AdminHomePage /> : <Navigate to="/login" />}
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
