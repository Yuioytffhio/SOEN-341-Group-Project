// frontend/src/lib/adminApi.js
import { db } from "./firebase";
import { doc, updateDoc, deleteField } from "firebase/firestore";

/** Set a user's role: "student" | "organizer" | "administrator" */
export async function setRole(uid, role) {
  if (!uid || !role) throw new Error("uid and role required");
  const ref = doc(db, "users", uid);

  // write to 'role' and remove any legacy 'platformRole'
  await updateDoc(ref, {
    role,
    platformRole: deleteField(), // cleans up old field if present
  });
}

/** Approve / reject event (unchanged) */
export async function approveEvent(eventId) {
  if (!eventId) throw new Error("eventId required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { status: "approved" });
}
export async function rejectEvent(eventId) {
  if (!eventId) throw new Error("eventId required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { status: "rejected" });
}
export const setUserRole = setRole;
export async function moderateEvent(eventId, status) {
  if (!eventId) throw new Error("eventId required");
  return status === "approved" ? approveEvent(eventId) : rejectEvent(eventId);
}
/** Update event compliance status (for policy review) */
export async function setEventCompliance(eventId, status) {
  if (!eventId || !status) throw new Error("Event ID and status are required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { complianceStatus: status });
}
/** Approve organizer account */
export async function approveOrganizer(uid) {
  if (!uid) throw new Error("UID required");
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    platformRole: "organizer",
    approvalStatus: "approved"
  });
}

/** Reject organizer account */
export async function rejectOrganizer(uid) {
  if (!uid) throw new Error("UID required");
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    platformRole: "student",
    approvalStatus: "rejected"
  });
}

