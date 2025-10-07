import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";

import HomePage from "./pages/student/HomePage/HomePage";
import EventDiscovery from "./pages/student/EventDiscovery/EventDiscovery";
import MyEvents from "./pages/student/MyEvents/MyEvents";
import AboutUs from "./pages/student/AboutUs/AboutUs";
import ProfilePage from "./pages/student/ProfilePage/ProfilePage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discovery" element={<EventDiscovery />} />
        <Route path="/myevents" element={<MyEvents />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;