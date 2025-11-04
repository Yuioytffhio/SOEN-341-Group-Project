import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MyEvents.css";
import DownloadIcon from "../../../assets/download_button.png";
import QRCode from "qrcode";
import { db, auth, storage } from "../../../firebaseConfig";
import { doc, setDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";


export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    const fetchSavedEvents = async () => {
      try {
        if (!user) {
          setError("Please log in to view your saved events.");
          setLoading(false);
          return;
        }

        const savedRef = collection(db, "users", user.uid, "savedEvents");
        const savedSnapshot = await getDocs(savedRef);
        const fetchedEvents = [];

        const formatDate = (dateValue) => {
          if (!dateValue) return null;
          if (dateValue.toDate) return dateValue.toDate();
          if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
          if (typeof dateValue === "string") return new Date(dateValue);
          return null;
        };

        for (const savedDoc of savedSnapshot.docs) {
          const savedData = savedDoc.data();
          const eventRef = doc(db, "events", savedData.eventId);
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
              ticketDate: formatDate(savedData.savedAt),
            });
          }
        }

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching saved events:", err);
        setError("Failed to load your saved events.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [user]);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const eventsForSelectedDate = selectedDate
    ? events.filter((e) => e.eventDate && isSameDay(e.eventDate, selectedDate))
    : events;

  const handleDownloadTicket = async (event) => {
    try {
      const ticketData = {
        title: event.eventTitle,
        date: event.eventDate?.toLocaleString() || "TBD",
        location: event.eventLocation,
        organization: event.eventOrganization,
        studentID: user.uid,
        issuedAt: event.ticketDate?.toLocaleString() || new Date().toLocaleString(),
      };

      const qrString = JSON.stringify(ticketData);
      const qrUrl = await QRCode.toDataURL(qrString);

      const link = document.createElement("a");
      link.href = qrUrl;
      link.download = `${event.eventTitle}-SavedEventQR.png`;
      link.click();
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  if (loading) return <p className="loading">Loading your saved events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="my-events-container">
      <div className="header-image">
        <h1>My Events</h1>
      </div>

      <div className="events-calendar-container">
        <div className="calendar-view">
          <h2>Calendar</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date }) =>
              events.some((e) => e.eventDate && isSameDay(e.eventDate, date))
                ? "highlighted-date"
                : null
            }
          />
        </div>

        <div className="events-list-section">
          {eventsForSelectedDate.length === 0 ? (
            <p className="no-events">
              {selectedDate
                ? "No events for this date."
                : "You haven’t saved any events yet."}
            </p>
          ) : (
            <div className="event-list">
              {eventsForSelectedDate.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-details">
                    <h3>{event.eventTitle}</h3>
                    <p className="event-description">{event.eventDescription}</p>
                    <p className="event-date">
                      {event.eventDate?.toLocaleString() || "Date TBD"}
                    </p>
                    <p className="event-location">{event.eventLocation}</p>
                    <p className="event-organization">{event.eventOrganization}</p>
                  </div>

                  <button
                    className="download-ticket-btn"
                    onClick={() => handleDownloadTicket(event)}
                  >
                    Download QR
                    <img src={DownloadIcon} alt="Download" className="download-icon" />
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