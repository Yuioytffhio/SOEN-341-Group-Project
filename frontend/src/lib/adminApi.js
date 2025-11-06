// frontend/src/lib/adminApi.js
import { db } from "./firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

/** Set a user's platform role: "user" | "organizer" | "admin" */
export async function setRole(uid, role) {
  if (!uid || !role) throw new Error("uid and role required");
  const ref = doc(db, "users", uid);
  await setDoc(ref, { platformRole: role }, { merge: true });
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

// --- Backward-compat aliases for any old imports ---
export const setUserRole = setRole;

export async function moderateEvent(eventId, status) {
  if (!eventId) throw new Error("eventId required");
  if (status === "approved") {
    return approveEvent(eventId);
  }
  return rejectEvent(eventId);
}
