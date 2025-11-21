import React, { useState, useEffect } from "react";
import "../Management/Management.css";
import { db } from "../../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const OversightAdmin = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);

  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("approved");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  // Load events categorized by complianceStatus
  useEffect(() => {
    const loadEvents = async () => {
      const snap = await getDocs(collection(db, "events"));
      const pending = [];
      const approved = [];

      snap.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        if (!data.complianceStatus || data.complianceStatus === "pending") {
          pending.push({ id, ...data });
        } else if (data.complianceStatus === "approved") {
          approved.push({ id, ...data });
        }
      });

      setPendingEvents(pending);
      setApprovedEvents(approved);
    };

    loadEvents();
  }, []);

  // Save updated compliance
  const handleSaveCompliance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    try {
      await updateDoc(doc(db, "events", eventId.trim()), {
        complianceStatus: status,
      });
      setResult("success");
      setEventId("");
      setStatus("approved");
    } catch (err) {
      console.error("Error:", err);
      setResult("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mgmt-page">
      <div className="mgmt-header">
        <h1>Oversight</h1>
        <p className="mgmt-subtitle">Admin oversight tools for events</p>
      </div>

      <div className="mgmt-grid">

        {/* Pending Events */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Pending Events</h2>
          {pendingEvents.length === 0 ? (
            <p>No pending events.</p>
          ) : (
            <ul>
              {pendingEvents.map((ev) => (
                <li key={ev.id}>{ev.eventTitle || ev.id}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Approved Events */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Approved Events</h2>
          {approvedEvents.length === 0 ? (
            <p>No approved events.</p>
          ) : (
            <ul>
              {approvedEvents.map((ev) => (
                <li key={ev.id}>{ev.eventTitle || ev.id}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Compliance Review */}
        <section className="mgmt-card" style={{ gridColumn: "1 / -1" }}>
          <h2 className="mgmt-card-title">Event Policy Compliance Review</h2>
          <form className="mgmt-form" onSubmit={handleSaveCompliance}>
            <label>Event ID</label>
            <input
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Enter Event ID"
              required
            />

            <label>Compliance Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving || !eventId.trim()}
            >
              {saving ? "Saving…" : "Save Decision"}
            </button>

            {result === "success" && (
              <p className="mgmt-status ok">Compliance updated!</p>
            )}
            {result === "error" && (
              <p className="mgmt-status err">Error saving update.</p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default OversightAdmin;

