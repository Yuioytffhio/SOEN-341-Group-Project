import { useState } from "react";
import { setRole, approveEvent, rejectEvent } from "../../../lib/adminApi";
import "./Management.css";

const Management = () => {
  // Assign Role state
  const [uid, setUid] = useState("");
  const [role, setRoleState] = useState("user");
  const [roleStatus, setRoleStatus] = useState(null);

  // Moderate Event state
  const [eventId, setEventId] = useState("");
  const [decision, setDecision] = useState("approved");
  const [modStatus, setModStatus] = useState(null);

  const onAssign = async (e) => {
    e.preventDefault();
    setRoleStatus("working");
    try {
      await setRole(uid.trim(), role);
      setRoleStatus("ok");
      setUid("");
      setRoleState("user");
    } catch (err) {
      setRoleStatus(err?.message || "error");
    }
  };

  const onModerate = async (e) => {
    e.preventDefault();
    setModStatus("working");
    try {
      if (decision === "approved") {
        await approveEvent(eventId.trim());
      } else {
        await rejectEvent(eventId.trim());
      }
      setModStatus("ok");
      setEventId("");
      setDecision("approved");
    } catch (err) {
      setModStatus(err?.message || "error");
    }
  };

  return (
    <div className="mgmt-page">
      <div className="mgmt-header">
        <h1>Management</h1>
        <p className="mgmt-subtitle">Admin tools for roles and event moderation</p>
      </div>

      <div className="mgmt-grid">
        {/* Assign Role */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Assign Platform Role</h2>
          <form onSubmit={onAssign} className="mgmt-form">
            <label className="mgmt-label" htmlFor="uid">User UID</label>
            <input
              id="uid"
              className="mgmt-input"
              placeholder="Firebase Auth UID"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
            />

            <label className="mgmt-label" htmlFor="role">Role</label>
            <select
              id="role"
              className="mgmt-select"
              value={role}
              onChange={(e) => setRoleState(e.target.value)}
            >
              <option value="user">user</option>
              <option value="organizer">organizer</option>
              <option value="admin">admin</option>
            </select>

            <div className="mgmt-actions">
              <button type="submit" className="btn btn-primary" disabled={!uid || roleStatus === "working"}>
                {roleStatus === "working" ? "Saving…" : "Set Role"}
              </button>
            </div>

            {roleStatus && roleStatus !== "working" && (
              <p className={`mgmt-status ${roleStatus === "ok" ? "ok" : "err"}`}>
                {roleStatus === "ok" ? "Role updated." : `Error: ${roleStatus}`}
              </p>
            )}
          </form>
        </section>

        {/* Moderate Event */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Moderate Event</h2>
          <form onSubmit={onModerate} className="mgmt-form">
            <label className="mgmt-label" htmlFor="eventId">Event ID</label>
            <input
              id="eventId"
              className="mgmt-input"
              placeholder="events/{id}"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />

            <label className="mgmt-label" htmlFor="decision">Decision</label>
            <select
              id="decision"
              className="mgmt-select"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>

            <div className="mgmt-actions">
              <button type="submit" className="btn btn-secondary" disabled={!eventId || modStatus === "working"}>
                {modStatus === "working" ? "Saving…" : "Update Status"}
              </button>
            </div>

            {modStatus && modStatus !== "working" && (
              <p className={`mgmt-status ${modStatus === "ok" ? "ok" : "err"}`}>
                {modStatus === "ok" ? "Event status updated." : `Error: ${modStatus}`}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Management;
