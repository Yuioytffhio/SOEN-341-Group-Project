import React, { useState, useEffect } from "react";
import "./ToolsOrg.css";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ToolsOrg() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [qrResult, setQrResult] = useState("");
  const [titleVisible, setTitleVisible] = useState(false);

  // Animate title
  useEffect(() => {
    setTimeout(() => setTitleVisible(true), 200);
  }, []);

  // Fetch all events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  // When event is selected → fetch attendees
  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    setAttendees([]);

    if (!eventId) return;

    try {
      // Get tickets for this event
      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, where("eventId", "==", eventId));
      const ticketSnap = await getDocs(q);

      const attendeePromises = ticketSnap.docs.map(async (ticketDoc) => {
        const ticketData = ticketDoc.data();
        const userId = ticketData.studentID;

        // Fetch student info from users collection
        const userSnap = await getDocs(
          query(collection(db, "users"), where("__name__", "==", userId))
        );

        const userData =
          !userSnap.empty ? userSnap.docs[0].data() : { firstName: "", lastName: "", email: "" };

        return {
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          ticketID: ticketDoc.id,
        };
      });

      const attendeesList = await Promise.all(attendeePromises);
      setAttendees(attendeesList);
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  // Export attendees to CSV
  const handleExportCSV = () => {
    if (!selectedEvent || attendees.length === 0) return;

    const csvRows = [
      ["Name", "Email", "Ticket ID"],
      ...attendees.map((a) => [a.name, a.email, a.ticketID]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const selected = events.find((ev) => ev.id === selectedEvent);
    link.download = `${selected.eventTitle}_Attendees.csv`;
    link.click();
  };

  // QR upload simulation
  const handleQRUpload = (event) => {
    const file = event.target.files[0];
    if (file) setQrResult(`✅ Ticket validated from: ${file.name}`);
  };

  return (
    <div className="tools-container">
      <h1 className={`page-title ${titleVisible ? "visible" : ""}`}>
        Organizer Tools
      </h1>

      <section className="tool-section">
        <h2>Export Attendee List</h2>
        <p>Select an event to export its attendee list in CSV format.</p>

        <select onChange={handleEventChange} value={selectedEvent}>
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventTitle}
            </option>
          ))}
        </select>

        <button
          onClick={handleExportCSV}
          disabled={!selectedEvent || attendees.length === 0}
          className={selectedEvent && attendees.length > 0 ? "active-btn" : "disabled-btn"}
        >
          Export CSV
        </button>

        {attendees.length > 0 && (
          <div className="attendee-list">
            <h3>Attendees</h3>
            <ul>
              {attendees.map((a, index) => (
                <li key={index}>
                  <strong>{a.name}</strong> — {a.email} ({a.ticketID})
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="tool-section">
        <h2>QR Ticket Validation</h2>
        <p>Upload a QR code image to validate a ticket.</p>
        <input type="file" accept="image/*" onChange={handleQRUpload} />
        {qrResult && <p className="qr-result">{qrResult}</p>}
      </section>
    </div>
  );
}
