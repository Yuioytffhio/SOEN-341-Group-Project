// frontend/src/lib/adminApi.js
import { db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

/** Set a user's platform role: "student" | "organizer" | "admin" */
export async function setRole(uid, role) {
  if (!uid || !role) throw new Error("uid and role required");
  const ref = doc(db, "users", uid);
  // IMPORTANT: update only (will FAIL if doc doesn't exist → no new docs created)
  await updateDoc(ref, { platformRole: role });
}

/** Approve event */
export async function approveEvent(eventId) {
  if (!eventId) throw new Error("eventId required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { status: "approved" });
}

/** Reject event */
export async function rejectEvent(eventId) {
  if (!eventId) throw new Error("eventId required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { status: "rejected" });
}

// --- Backward-compat aliases (keep for old imports) ---
export const setUserRole = setRole;

export async function moderateEvent(eventId, status) {
  if (!eventId) throw new Error("eventId required");
  if (status === "approved") return approveEvent(eventId);
  return rejectEvent(eventId);
}
