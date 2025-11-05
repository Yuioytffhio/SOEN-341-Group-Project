import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MyEvents.css";
import DownloadIcon from "../../../assets/download_button.png";
import { db, auth } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        if (!user) {
          setError("Please log in to view your saved events.");
          setLoading(false);
          return;
        }

        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("uid", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          setError("User not found in the database.");
          setLoading(false);
          return;
        }

        const studentID = userSnapshot.docs[0].id; 

        const ticketsRef = collection(db, "tickets");
        const qTickets = query(ticketsRef, where("studentID", "==", studentID));
        const ticketsSnapshot = await getDocs(qTickets);

        const fetchedEvents = [];

        for (const ticketDoc of ticketsSnapshot.docs) {
          const ticketData = ticketDoc.data();
          const eventRef = doc(db, "events", ticketData.eventId);
          const eventSnap = await getDoc(eventRef);

          if (eventSnap.exists()) {
            const eventData = eventSnap.data();
            const eventDate = eventData.eventDate?.seconds
              ? new Date(eventData.eventDate.seconds * 1000)
              : eventData.eventDate
              ? new Date(eventData.eventDate)
              : null;

            fetchedEvents.push({
              id: ticketDoc.id,
              eventId: ticketData.eventId,
              eventTitle: eventData.eventTitle || "Untitled Event",
              eventDescription: eventData.eventDescription || "",
              eventDate: eventDate,
              eventLocation: eventData.eventLocation || "",
              eventOrganization: eventData.eventOrganization || "",
              qrCode: ticketData.qrCodeImage,
            });
          }
        }

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load your tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [user]);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const eventsForSelectedDate =
    selectedDate && events.length > 0
      ? events.filter(
          (e) => e.eventDate && isSameDay(e.eventDate, selectedDate)
        )
      : events;

  const handleDownloadQR = (event) => {
    if (!event.qrCode) {
      alert("No QR code found for this ticket.");
      return;
    }
    const link = document.createElement("a");
    link.href = event.qrCode;
    link.download = `${event.eventTitle}-QR.png`;
    link.click();
  };

  if (loading) return <p className="loading">Loading your events...</p>;
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
                : "You haven't purchased any tickets yet."}
            </p>
          ) : (
            <div className="event-list">
              {eventsForSelectedDate.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-details">
                    <h3>{event.eventTitle}</h3>
                    <p className="event-description">
                      {event.eventDescription}
                    </p>
                    <p className="event-date">
                      {event.eventDate?.toLocaleString() || "Date TBD"}
                    </p>
                    <p className="event-location">{event.eventLocation}</p>
                    <p className="event-organization">
                      {event.eventOrganization}
                    </p>
                  </div>

                  <button
                    className="download-ticket-btn"
                    onClick={() => handleDownloadQR(event)}
                  >
                    Download QR
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
