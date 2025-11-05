import React, { useState, useEffect } from "react";
import "./ToolsOrg.css";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import QrScanner from "qr-scanner";

export default function ToolsOrg() {
  const [events, setEvents] = useState([]);
  const [exportEvent, setExportEvent] = useState(""); 
  const [validationEvent, setValidationEvent] = useState(""); 
  const [attendees, setAttendees] = useState([]);
  const [qrFile, setQrFile] = useState(null); 
  const [qrResult, setQrResult] = useState("");
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setTitleVisible(true), 200);
  }, []);

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

  const handleExportChange = async (e) => {
    const eventId = e.target.value;
    setExportEvent(eventId);
    setAttendees([]);

    if (!eventId) return;

    try {
      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, where("eventId", "==", eventId));
      const ticketSnap = await getDocs(q);

      const attendeePromises = ticketSnap.docs.map(async (ticketDoc) => {
        const ticketData = ticketDoc.data();
        const userId = ticketData.studentID;

        const userSnap = await getDocs(
          query(collection(db, "users"), where("__name__", "==", userId))
        );

        const userData =
          !userSnap.empty
            ? userSnap.docs[0].data()
            : { firstName: "", lastName: "", email: "" };

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

  const handleExportCSV = () => {
    if (!exportEvent || attendees.length === 0) return;

    const csvRows = [
      ["Name", "Email", "Ticket ID"],
      ...attendees.map((a) => [a.name, a.email, a.ticketID]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const selected = events.find((ev) => ev.id === exportEvent);
    link.download = `${selected?.eventTitle || "event"}_Attendees.csv`;
    link.click();
  };

  const handleQRUpload = (event) => {
    const file = event.target.files[0];
    setQrFile(file);
    setQrResult(""); 
  };

  const handleValidate = async () => {
    if (!qrFile) {
      setQrResult("Please upload a QR code image first.");
      return;
    }

    if (!validationEvent) {
      setQrResult("Please select an event before validating.");
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(qrFile);
      const decoded = await QrScanner.scanImage(imageUrl);
      const scannedText = decoded.trim();

      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, where("qrCodeValue", "==", scannedText));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setQrResult("Invalid QR code — no matching ticket found.");
        return;
      }

      const ticket = snapshot.docs[0].data();

      if (ticket.eventId === validationEvent) {
        setQrResult(`Valid ticket for ${ticket.eventTitle}`);
      } else {
        setQrResult("QR code does not match this event.");
      }
    } catch (error) {
      console.error("Error validating QR:", error);
      setQrResult("Could not decode or validate QR image.");
    }
  };

  return (
    <div className="tools-container">
      <h1 className={`page-title ${titleVisible ? "visible" : ""}`}>
        Organizer Tools
      </h1>

      <section className="tool-section">
        <h2>Export Attendee List</h2>
        <p>Select an event to export its attendee list in CSV format.</p>

        <select onChange={handleExportChange} value={exportEvent}>
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventTitle}
            </option>
          ))}
        </select>

        <button
          onClick={handleExportCSV}
          disabled={!exportEvent || attendees.length === 0}
          className={
            exportEvent && attendees.length > 0 ? "active-btn" : "disabled-btn"
          }
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
        <p>
          Select an event, upload a QR code image, then click <b>Validate</b>.
        </p>

        <select
          onChange={(e) => setValidationEvent(e.target.value)}
          value={validationEvent}
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventTitle}
            </option>
          ))}
        </select>

        <input type="file" accept="image/*" onChange={handleQRUpload} />

        <button
          onClick={handleValidate}
          disabled={!validationEvent || !qrFile}
          className={
            validationEvent && qrFile ? "active-btn" : "disabled-btn"
          }
        >
          Validate
        </button>

        {qrResult && <p className="qr-result">{qrResult}</p>}
      </section>
    </div>
  );
}
