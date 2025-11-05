import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import HomePageNavBar from "./pages/HomePageNavBar.jsx";
// Public pages
import HomePage from "./pages/HomePage.jsx"; // Landing page
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import AboutUs from "./pages/AboutUs";
import PublicAboutUs from "./pages/PublicAboutUs.jsx";
// Navbars for different roles

import Navbar from "./components/navbarstudent/NavbarStudent";    
import NavbarOrg from "./components/navbarorg/NavBarOrg";
import NavbarAdmin from "./components/navbaradmin/NavBarAdmin";             // for logged-in users
// Student pages
import StudentHomePage from "./pages/student/HomePageStudent/HomePageStudent";
import EventDiscovery from "./pages/student/EventDiscovery/EventDiscovery";
import MyEvents from "./pages/student/MyEvents/MyEvents";
import ProfilePage from "./pages/student/ProfilePage/ProfilePage";
// Organizer Pages 
import OrgHomePage from "./pages/organizer/HomePageOrg/HomePageOrg.jsx";
import EventCreation from "./pages/organizer/EventCreation/EventCreation";
import AnalyticsOrg from "./pages/organizer/AnalyticsOrg/AnalyticsOrg";
import ToolsOrg from "./pages/organizer/ToolsOrg/ToolsOrg.jsx";
// Administrator Pages
import AdminHomePage from "./pages/administrator/HomePageAdmin/HomePageAdmin.jsx";
import OversightAdmin from "./pages/administrator/OversightAdmin/OversightAdmin.jsx";
import AnalyticsAdmin from "./pages/administrator/AnalyticsAdmin/AnalyticsAdmin";
import Management from "./pages/administrator/Management/Management";



function AppContent() {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Public pages use HomePageNavBar
  const isPublicPage =
    location.pathname === "/" || location.pathname === "/login" || location.pathname == "/signuppage";

  const isPublicAboutUsPage = location.pathname === "/publicaboutus";

  const renderNavbar = () => {
    if (isPublicPage) return <HomePageNavBar />;
    if(isPublicAboutUsPage) return <HomePageNavBar />;

    if (isLoggedIn) {
      switch (role) {
        case "student":
          return <Navbar />;
        case "organizer":
          return <NavbarOrg />;
        case "administrator":
          return <NavbarAdmin />;
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <>
      {/* Navbar switcher */}
      {/*
      {isPublicPage ? <HomePageNavBar /> : isLoggedIn && <Navbar />}
      */}
      {renderNavbar()}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signuppage" element={<SignUpPage />} />
        <Route path="/publicaboutus" element={<PublicAboutUs />} />

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
          element={isLoggedIn ? <OrgHomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/eventcreation"
          element={isLoggedIn ? <EventCreation /> : <Navigate to="/login" />}
        />
        <Route
          path="/analyticsorg"
          element={isLoggedIn ? <AnalyticsOrg /> : <Navigate to="/login" />}
        />
        <Route
          path="/toolsorg"
          element={isLoggedIn ? <ToolsOrg /> : <Navigate to="/login" />}
        />
        {/* Admin Routes */}
        <Route
          path="/adminHome"
          element={isLoggedIn ? <AdminHomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/oversightadmin"
          element={isLoggedIn ? <OversightAdmin /> : <Navigate to="/login" />}
        />
        <Route
          path="/analyticsadmin"
          element={isLoggedIn ? <AnalyticsAdmin /> : <Navigate to="/login" />}
        />
        <Route
          path="/management"
          element={isLoggedIn ? <Management /> : <Navigate to="/login" />}
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
