// frontend/src/lib/adminApi.js
import { db } from "./firebase";
import {
  doc,
  updateDoc,
  deleteField,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

/* ================================
   USER ROLE + ORGANIZER APPROVAL
================================= */

/** Set a user's role: "student" | "organizer" | "administrator" */
export async function setRole(uid, role) {
  if (!uid || !role) throw new Error("uid and role required");
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    role,
    platformRole: deleteField(), // cleanup
  });
}

/** Approve organizer account */
export async function approveOrganizer(uid) {
  if (!uid) throw new Error("UID required");
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    platformRole: "organizer",
    approvalStatus: "approved",
  });
}

/** Reject organizer account */
export async function rejectOrganizer(uid) {
  if (!uid) throw new Error("UID required");
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    platformRole: "student",
    approvalStatus: "rejected",
  });
}


/* ================================
     EVENT STATUS MANAGEMENT
================================= */

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

/** Move event back to pending */
export async function unapproveEvent(eventId) {
  if (!eventId) throw new Error("eventId required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { status: "pending" });
}

/** Soft-delete an event (mark as deleted) */
export async function deleteEvent(eventId) {
  if (!eventId) throw new Error("eventId required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { status: "deleted" });
}


/* ================================
    EVENT FETCHING (PENDING / APPROVED)
================================= */

/** Get all events with a specific status */
export async function getEventsByStatus(status) {
  const q = query(collection(db, "events"), where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


/* ================================
     EVENT COMPLIANCE (Policy UI)
================================= */

export async function setEventCompliance(eventId, status) {
  if (!eventId || !status) throw new Error("Event ID and status are required");
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, { complianceStatus: status });
}


/* ================================
        BACKWARD COMPAT
================================= */

export const setUserRole = setRole;

export async function moderateEvent(eventId, status) {
  if (!eventId) throw new Error("eventId required");
  return status === "approved"
    ? approveEvent(eventId)
    : rejectEvent(eventId);
}


