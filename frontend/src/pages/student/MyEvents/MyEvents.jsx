import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MyEvents.css";
import "leaflet/dist/leaflet.css";
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
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { Icon, DivIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import st_map_background from "../../../assets/admin_oversight_background.jpg";

const pin_icon = new Icon({
    iconUrl: require("../../../assets/map_pin.png"),
    iconSize: [38, 38]
});

const cluster_icon = function (cluster) {
    return new DivIcon({
        html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
        className: "custom-marker-cluster",
        iconSize: point(33, 33, true)
    });
};

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
              eventLatitude: eventData.locationLat,
              eventLongitude: eventData.locationLng,
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

  if (loading) return <p className="st-loading">Loading your events...</p>;
  if (error) return <p className="st-error">{error}</p>;

  return (
    <div className="st-my-events-container">
      <div className="st-header-image">
        <h1>My Events</h1>
      </div>

      <div className="st-events-calendar-container">
        <div className="st-vertical-container" style={{ background: `url(${st_map_background}) no-repeat center center / cover` }}>
            <div className="st-calendar-view">
              <h2>Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={({ date }) =>
                  eventsForSelectedDate.some((e) => e.eventDate && isSameDay(e.eventDate, date))
                    ? "st-highlighted-date"
                    : null
                }
              />
            </div>

            <div className="st-map-view">
                <MapContainer center={[45.49496332993856, -73.57873781484274]} zoom={12} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MarkerClusterGroup chunkedLoading iconCreateFunction={cluster_icon}>
                        {eventsForSelectedDate.map((event) =>
                            !isNaN(event.eventLatitude) &&
                            !isNaN(event.eventLongitude) ? (
                                <Marker position={[event.eventLatitude, event.eventLongitude]} icon={pin_icon}>
                                    <Tooltip className="st-description-box" direction="top" offset={[0, -10]} opacity={1}>
                                        <div style={{ fontWeight: "bold" }}>{event.eventTitle}</div>
                                        <div>{event.eventDate?.toISOString().slice(0, 10) ?? "Date TBD"}</div>
                                        <div>{"Press marker to Open Google Maps"}</div>
                                    </Tooltip>
                                    <Popup>
                                        <div
                                            style={{ cursor: "pointer", color: "#1a73e8", fontWeight: "bold" }}
                                            onClick={() =>
                                                window.open(`https://www.google.com/maps?q=${event.eventLatitude},${event.eventLongitude}`)
                                            }
                                        >
                                            {"Head to: " + event.eventTitle}
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : null)}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
        </div>

        <div className="st-events-list-section">
          {eventsForSelectedDate.length === 0 ? (
            <p className="st-no-events">
              {selectedDate
                ? "No events for this date."
                : "You haven't purchased any tickets yet."}
            </p>
          ) : (
            <div className="st-event-list">
              {eventsForSelectedDate.map((event) => (
                <div key={event.id} className="st-event-item">
                  <div className="st-event-details">
                    <h3>{event.eventTitle}</h3>
                    <p className="st-event-description">
                      {event.eventDescription}
                    </p>
                    <p className="st-event-date">
                      {event.eventDate?.toLocaleString() || "Date TBD"}
                    </p>
                    <p className="st-event-location">{event.eventLocation}</p>
                    <p className="st-event-organization">
                      {event.eventOrganization}
                    </p>
                  </div>

                  <button
                    className="st-download-ticket-btn"
                    onClick={() => handleDownloadQR(event)}
                  >
                    Download QR
                    <img
                      src={DownloadIcon}
                      alt="Download"
                      className="st-download-icon"
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
