import React, { useEffect, useState } from "react";
import "./MyEvents.css";
import headerImage from "../../../assets/MyEventsHeader.png";
import DownloadIcon from "../../../assets/download_button.png";
import QRCode from "qrcode";
import { db, storage } from "../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentID = localStorage.getItem("customID");

  useEffect(() => {
    const fetchStudentEvents = async () => {
      try {
        if (!studentID) {
          setError("No student ID found. Please log in again.");
          setLoading(false);
          return;
        }

        const ticketsRef = collection(db, "tickets");
        const q = query(ticketsRef, where("studentID", "==", studentID));
        const ticketsSnapshot = await getDocs(q);

        if (ticketsSnapshot.empty) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const fetchedEvents = [];

        const formatDate = (dateValue) => {
          if (!dateValue) return "N/A";
          if (dateValue.toDate) return dateValue.toDate().toLocaleString();
          if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleString();
          if (typeof dateValue === "string") return dateValue;
          return "Invalid date";
        };

        for (const ticketDoc of ticketsSnapshot.docs) {
          const ticketData = ticketDoc.data();
          const eventRef = doc(db, "events", ticketData.eventId);
          const eventSnap = await getDoc(eventRef);

          if (eventSnap.exists()) {
            const eventData = eventSnap.data();

            fetchedEvents.push({
              id: eventSnap.id,
              eventTitle: eventData.eventTitle,
              eventDescription: eventData.eventDescription,
              eventDate: formatDate(eventData.eventDate),
              eventLocation: eventData.eventLocation,
              eventOrganization: eventData.eventOrganization,
              ticketDate: formatDate(ticketData.ticketdate),
            });
          }
        }

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching student events:", err);
        setError("Failed to load your booked events.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentEvents();
  }, [studentID]);

  const handleDownloadTicket = async (event) => {
    try {
      const ticketData = {
        title: event.eventTitle,
        date: event.eventDate,
        location: event.eventLocation,
        organization: event.eventOrganization,
        studentID,
        issuedAt: event.ticketDate,
      };

      const qrString = JSON.stringify(ticketData);
      const qrUrl = await QRCode.toDataURL(qrString);

      const link = document.createElement("a");
      link.href = qrUrl;
      link.download = `${event.eventTitle}-TicketQR.png`;
      link.click();
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  if (loading) return <p className="loading">Loading your booked events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="my-events-container">
      <div className="header-image">
        <h1>My Events</h1>
      </div>

      <div className="events-calendar-container">
        <div className="calendar-view">
          <h2>Calendar</h2>
          <div className="calendar-placeholder">Calendar will be here</div>
        </div>

        <div className="events-list-section">
          {events.length === 0 ? (
            <p className="no-events">You haven’t purchased any events yet.</p>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-details">
                    <h3>{event.eventTitle}</h3>
                    <p className="event-description">{event.eventDescription}</p>
                    <p className="event-date">{event.eventDate}</p>
                    <p className="event-location">{event.eventLocation}</p>
                    <p className="event-organization">{event.eventOrganization}</p>
                  </div>

                  <button
                    className="download-ticket-btn"
                    onClick={() => handleDownloadTicket(event)}
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
}
