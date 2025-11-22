import React, { useState, useEffect } from "react";
import "./OversightAdmin.css";
import oversight_background from "../../../assets/admin_oversight_background.jpg";

import { setEventCompliance } from "../../../lib/adminApi";
import { db } from "../../../lib/firebase";

//import { auth, db } from "../../../firebaseConfig";
import { auth } from "../../../firebaseConfig";

import {
  collection,
  getDocs,
  updateDoc, doc,
  query,
} from "firebase/firestore";

const OversightAdmin = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);

  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("approved");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Display approved and pending events 
    const [allEvents, setAllEvents] = useState([]);
  
    // Fetch all events 
    const fetchAllEvents = async () => {
      if (!auth.currentUser) return;
  
      const q = query(collection(db, "events"));
      const querySnapshot = await getDocs(q);
  
      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllEvents(events);
      
      setLoading(false);
    };
  
    useEffect(() => {
      fetchAllEvents();
    }, []);
  

  
  if (loading) return <p className="o-analytics-loading">Loading oversight...</p>;

  return (
    <div className="oversight-page" style={{ background: `url(${oversight_background}) no-repeat center center / cover` }}>

      <div className="form-oversight-container">
        <div className="oversight-header">
          <h1 className="oversight-title">Oversight</h1>
          <p className="oversight-subtitle">
            Admin oversight tools for organizer approvals and policy compliance
          </p>
        </div>

        <div className="o-content-container">
          <div className="oversight-grid">
            {/* Event Policy Compliance Moderation */}
            <section className="oversight-card">
              <h2 className="oversight-card-title">Event Policy Compliance Review</h2>
              <form className="oversight-form" onSubmit={handleSaveCompliance}>
                <label className="oversight-label" htmlFor="policyEventId">Event ID</label>
                <input
                  id="policyEventId"
                  className="oversight-input"
                  placeholder="Enter Event ID to review"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  required
                />

                <label className="oversight-label" htmlFor="policyDecision">Compliance Status</label>
                <select
                  id="policyDecision"
                  className="oversight-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="approved">Approved</option>
                  <option value="needs-review">Needs Review</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="oversight-actions" style={{ marginTop: "10px" }}>
                  <button
                    type="submit"
                    className="o-btn"
                    disabled={saving || !eventId}
                  >
                   {saving ? "Saving…" : "Save Decision"}
                  </button>
                </div>

                  {result === "success" && (
                    <p className="oversight-status-ok">Compliance status updated successfully.</p>
                  )}
                  {result === "error" && (
                    <p className="oversight-status-err">Failed to update compliance status.</p>
                  )}
              </form>
            </section>
          </div>

          <div className="o-events-section">
            {/* Pending Events */}
            <h2 className="o-pending-events-title">Pending Events</h2>
            <div className="o-pending-events">
              {pendingEvents.length === 0 ? (
               <p>No pending events yet.</p>
                 ) : (
                  pendingEvents.map((event) => (

                  //allEvents.map((event) => (
                <div key={event.id} className="o-event-pending-card">
                  <h3>{event.eventTitle}</h3>
                  <p>{event.eventDescription}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.eventDate.seconds * 1000).toLocaleString()}
                  </p>
                  <p>
                  <strong>Location:</strong> {event.eventLocation}
                  </p>
                </div>
                ))
              )}


              </div>

            {/* Approved Events */}
            <h2 className="o-approved-events-title">Approved Events</h2>
            <section className="o-approved-events">
              {approvedEvents.length === 0 ? (
               <p>No events created yet.</p>
                 ) : (
                  approvedEvents.map((event) => (
                 //allEvents.map((event) => (
                <div key={event.id} className="o-event-approved-card">
                  <h3>{event.eventTitle}</h3>
                  <p>{event.eventDescription}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.eventDate.seconds * 1000).toLocaleString()}
                  </p>
                  <p>
                  <strong>Location:</strong> {event.eventLocation}
                  </p>
                </div>
                ))
              )}
            </section>

          </div>
          
        </div>
          
        
      </div>
    </div>
  );
};

export default OversightAdmin;

