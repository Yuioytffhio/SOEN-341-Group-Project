import { useState } from "react";
import {
  setRole,
  approveEvent,
  rejectEvent,
  approveOrganizer,
  rejectOrganizer,
} from "../../../lib/adminApi";
import "./Management.css";

const Management = () => {
  // Assign Role state
  const [uid, setUid] = useState("");
  const [role, setRoleState] = useState("student");
  const [roleStatus, setRoleStatus] = useState(null);

  // Organizer Approvals state
  const [orgUid, setOrgUid] = useState("");
  const [orgStatus, setOrgStatus] = useState(null);
  const [orgWorking, setOrgWorking] = useState(false);

  // Moderate Event state
  const [eventId, setEventId] = useState("");
  const [decision, setDecision] = useState("approved");
  const [modStatus, setModStatus] = useState(null);

  // Assign Role
  const onAssign = async (e) => {
    e.preventDefault();
    setRoleStatus("working");
    try {
      await setRole(uid.trim(), role);
      setRoleStatus("ok");
      setUid("");
      setRoleState("student");
    } catch (err) {
      setRoleStatus(err?.message || "error");
    }
  };

  // Organizer Approval handlers
  const handleApproveOrg = async () => {
    setOrgWorking(true);
    try {
      await approveOrganizer(orgUid.trim());
      setOrgStatus("approved");
      setOrgUid("");
    } catch (err) {
      console.error("Error approving organizer:", err);
      setOrgStatus("error");
    } finally {
      setOrgWorking(false);
    }
  };

  const handleRejectOrg = async () => {
    setOrgWorking(true);
    try {
      await rejectOrganizer(orgUid.trim());
      setOrgStatus("rejected");
      setOrgUid("");
    } catch (err) {
      console.error("Error rejecting organizer:", err);
      setOrgStatus("error");
    } finally {
      setOrgWorking(false);
    }
  };

  // Moderate Event
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
        <p className="mgmt-subtitle">
          Admin tools for roles and event moderation
        </p>
      </div>

      <div className="mgmt-grid">
        {/* Assign Role */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Assign Platform Role</h2>
          <form onSubmit={onAssign} className="mgmt-form">
            <label className="mgmt-label" htmlFor="uid">
              Student UID
            </label>
            <input
              id="uid"
              className="mgmt-input"
              placeholder="Firebase Auth UID"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
            />

            <label className="mgmt-label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="mgmt-select"
              value={role}
              onChange={(e) => setRoleState(e.target.value)}
            >
              <option value="student">student</option>
              <option value="organizer">organizer</option>
              <option value="administrator">administrator</option>
            </select>

            <div className="mgmt-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!uid || roleStatus === "working"}
              >
                {roleStatus === "working" ? "Saving…" : "Set Role"}
              </button>
            </div>

            {roleStatus && roleStatus !== "working" && (
              <p
                className={`mgmt-status ${
                  roleStatus === "ok" ? "ok" : "err"
                }`}
              >
                {roleStatus === "ok"
                  ? "Role updated."
                  : `Error: ${roleStatus}`}
              </p>
            )}
          </form>
        </section>

        {/* Organizer Approval Panel — Implements #20 */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Organizer Account Approvals</h2>
          <form className="mgmt-form" onSubmit={(e) => e.preventDefault()}>
            <label className="mgmt-label" htmlFor="orgUid">
              Organizer UID
            </label>
            <input
              id="orgUid"
              className="mgmt-input"
              placeholder="Enter organizer’s UID to approve or reject"
              value={orgUid}
              onChange={(e) => setOrgUid(e.target.value)}
              required
            />

            <div className="mgmt-actions" style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApproveOrg}
                disabled={!orgUid || orgWorking}
              >
                {orgWorking ? "Approving…" : "Approve"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRejectOrg}
                disabled={!orgUid || orgWorking}
              >
                {orgWorking ? "Rejecting…" : "Reject"}
              </button>
            </div>

            {orgStatus === "approved" && (
              <p className="mgmt-status ok">
                Organizer approved successfully.
              </p>
            )}
            {orgStatus === "rejected" && (
              <p className="mgmt-status err">
                Organizer rejected successfully.
              </p>
            )}
            {orgStatus === "error" && (
              <p className="mgmt-status err">
                Error updating organizer account.
              </p>
            )}
          </form>
        </section>

        {/* Moderate Event */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Moderate Event</h2>
          <form onSubmit={onModerate} className="mgmt-form">
            <label className="mgmt-label" htmlFor="eventId">
              Event ID
            </label>
            <input
              id="eventId"
              className="mgmt-input"
              placeholder="events/{id}"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />

            <label className="mgmt-label" htmlFor="decision">
              Decision
            </label>
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
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={!eventId || modStatus === "working"}
              >
                {modStatus === "working" ? "Saving…" : "Update Status"}
              </button>
            </div>

            {modStatus && modStatus !== "working" && (
              <p
                className={`mgmt-status ${
                  modStatus === "ok" ? "ok" : "err"
                }`}
              >
                {modStatus === "ok"
                  ? "Event status updated."
                  : `Error: ${modStatus}`}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Management;
