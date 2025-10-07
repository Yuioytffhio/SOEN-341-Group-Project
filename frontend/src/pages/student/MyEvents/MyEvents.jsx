import React from "react";
import "./MyEvents.css";
import headerImage from "../../../assets/MyEventsHeader.png";
import TedTalk from "../../../assets/TedTalk.png";
import GetTogether from "../../../assets/getTogether.jpg";
import DownloadIcon from "../../../assets/download_button.png";

const MyEvents = () => {
  const events = [
    { 
      id: 1, 
      name: "TED Talk", 
      description: "An inspiring talk featuring innovative ideas worth spreading.",
      date: "2025-10-20", 
      location: "Hall Building", 
      image: TedTalk 
    },
    { 
      id: 2, 
      name: "Get Together", 
      description: "A fun networking night for students and faculty to connect.", 
      date: "2025-11-05", 
      location: "ER Building", 
      image: GetTogether 
    }
  ];

  const handleDownloadTicket = (eventName) => {
    const ticketContent = `Ticket for ${eventName}\nDate: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([ticketContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${eventName}-Ticket.txt`;
    link.click();
  };

  return (
    <div className="my-events-container">
      {/* HEADER SECTION */}
      <div className="header-image">
        <h1>My Events</h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="events-calendar-container">
        
        {/* CALENDAR VIEW */}
        <div className="calendar-view">
          <h2>Calendar</h2>
          {/* Placeholder for a real calendar */}
          <div className="calendar-placeholder">
            📅 Calendar will be here
          </div>
        </div>

        {/* EVENTS LIST */}
        <div className="events-list-section">
          {events.length === 0 ? (
            <p className="no-events">You haven’t purchased any events yet.</p>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <img src={event.image} alt={event.name} className="event-image" />
                  <div className="event-details">
                    <h3>{event.name}</h3>
                    <p className="event-description">{event.description}</p>
                    <p className="event-date">{event.date}</p>
                    <p className="event-location">{event.location}</p>
                  </div>
                  <button 
                    className="download-ticket-btn"
                    onClick={() => handleDownloadTicket(event.name)}
                  >
                    Download Ticket
                    <img 
                      src={DownloadIcon} 
                      alt="Download" 
                      className="download-icon"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEvents;