import React, { useState } from "react";
import "../Management/Management.css";
import { setEventCompliance } from "../../../lib/adminApi";

const OversightAdmin = () => {
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("approved");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const handleSaveCompliance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      await setEventCompliance(eventId.trim(), status);
      setResult("success");
      setEventId("");
      setStatus("approved");
    } catch (err) {
      console.error("Error saving compliance:", err);
      setResult("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mgmt-page">
      <div className="mgmt-header">
        <h1>Oversight</h1>
        <p className="mgmt-subtitle">
          Admin oversight tools for organizer approvals and policy compliance
        </p>
      </div>

      <div className="mgmt-grid">
        
        {/* Event Policy Compliance Moderation */}
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Event Policy Compliance Review</h2>
          <form className="mgmt-form" onSubmit={handleSaveCompliance}>
            <label className="mgmt-label" htmlFor="policyEventId">Event ID</label>
            <input
              id="policyEventId"
              className="mgmt-input"
              placeholder="Enter Event ID to review"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />

            <label className="mgmt-label" htmlFor="policyDecision">Compliance Status</label>
            <select
              id="policyDecision"
              className="mgmt-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="approved">Approved</option>
              <option value="needs-review">Needs Review</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="mgmt-actions" style={{ marginTop: "10px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !eventId}
              >
                {saving ? "Saving…" : "Save Decision"}
              </button>
            </div>

            {result === "success" && (
              <p className="mgmt-status ok">Compliance status updated successfully.</p>
            )}
            {result === "error" && (
              <p className="mgmt-status err">Failed to update compliance status.</p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default OversightAdmin;
