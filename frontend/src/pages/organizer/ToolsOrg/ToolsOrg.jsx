import React, { useState, useEffect } from "react";
import "./ToolsOrg.css";

export default function ToolsOrg() {
  const events = [
    { id: 1, name: "TED Talk" },
    { id: 2, name: "Software Engineering Conference" },
    { id: 3, name: "AI Evolving Technology" },
  ];

  const attendeeData = {
    1: [
      { name: "Alice Johnson", email: "alice@ted.com", ticketID: "TED001" },
      { name: "Bob Smith", email: "bob@ted.com", ticketID: "TED002" },
    ],
    2: [
      { name: "Catherine Lee", email: "catherine@sec.com", ticketID: "SEC001" },
      { name: "Daniel Brown", email: "daniel@sec.com", ticketID: "SEC002" },
      { name: "Emma White", email: "emma@sec.com", ticketID: "SEC003" },
    ],
    3: [
      { name: "Frank Green", email: "frank@ai.com", ticketID: "AI001" },
      { name: "Grace Kim", email: "grace@ai.com", ticketID: "AI002" },
    ],
  };

  const [selectedEvent, setSelectedEvent] = useState("");
  const [qrResult, setQrResult] = useState("");
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    // triggers animation after mount
    setTimeout(() => setTitleVisible(true), 200);
  }, []);

  const handleEventChange = (e) => setSelectedEvent(e.target.value);

  const handleExportCSV = () => {
    if (!selectedEvent) return;
    const attendees = attendeeData[selectedEvent];
    const csvRows = [
      ["Name", "Email", "Ticket ID"],
      ...attendees.map((a) => [a.name, a.email, a.ticketID]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      events.find((ev) => ev.id === parseInt(selectedEvent)).name
    }_Attendees.csv`;
    link.click();
  };

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
          <option value=""> Select an event </option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleExportCSV}
          disabled={!selectedEvent}
          className={selectedEvent ? "active-btn" : "disabled-btn"}
        >
          Export CSV
        </button>
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
