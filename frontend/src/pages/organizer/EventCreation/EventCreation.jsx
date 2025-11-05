import { useState, useEffect } from "react";
import "./EventCreation.css";

import { auth, db } from "../../../firebaseConfig";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const EventCreation = () => {
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDescription: "",
    eventDate: "",
    eventLocation: "",
    eventCapacity: "",
    eventCategory: "",
    eventOrganization: "",
    ticketType: "free",
  });

  const [userEvents, setUserEvents] = useState([]);
  const [editEventId, setEditEventId] = useState(null);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch events created by current user
  const fetchUserEvents = async () => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "events"), where("createdBy", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUserEvents(events);
  };

  useEffect(() => {
    fetchUserEvents();
  }, []);

  // Edit an existing event
  const handleEdit = (event) => {
    setFormData({
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      eventDate: new Date(event.eventDate.seconds * 1000).toISOString().slice(0, 16),
      eventLocation: event.eventLocation,
      eventCapacity: event.eventCapacity,
      eventCategory: event.eventCategory,
      eventOrganization: event.eventOrganization,
      ticketType: event.ticketType,
    });
    setEditEventId(event.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete an event
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
      alert("Event deleted!");
      fetchUserEvents();
    }
  };

  // Create or update event
  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    try {
      if (editEventId) {

        // Updates existing event
        const eventRef = doc(db, "events", editEventId);
        await updateDoc(eventRef, {
          ...formData,
          eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
          eventCapacity: Number(formData.eventCapacity),
          updatedAt: serverTimestamp(),
        });
        alert("Event updated successfully!");
        setEditEventId(null);
      } else {

        // Create new event
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);

        let maxEventIndex = 0;
        eventsSnapshot.forEach((eventDocument) => {
          const id = eventDocument.id;
          if (id.startsWith("eventId_")) {
            const eventIndex = parseInt(id.replace("eventId_", ""));
            if (!isNaN(eventIndex) && eventIndex > maxEventIndex) {
              maxEventIndex = eventIndex;
            }
          }
        });

        const nextEventIndex = maxEventIndex + 1;
        const newEventId = `eventId_${String(nextEventIndex).padStart(3, "0")}`;

        const eventDoc = doc(eventsCollection, newEventId);
        await setDoc(eventDoc, {
          ...formData,
          eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
          eventCapacity: Number(formData.eventCapacity),
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser ? auth.currentUser.uid : null,
        });

        alert("Event successfully created!");
      }

      // Reset form & refresh events
      setFormData({
        eventTitle: "",
        eventDescription: "",
        eventDate: "",
        eventLocation: "",
        eventCapacity: "",
        eventCategory: "",
        eventOrganization: "",
        ticketType: "free",
      });
      fetchUserEvents();
    } catch (error) {
      console.error("Error adding/updating event:", error);
      alert("There was an error processing the event. Please try again.");
    }
  };

  return (
    <div className="eventcreation-page">
      <h1>{editEventId ? "Edit Event" : "Create an Event"}</h1>

      <form className="eventcreation-form" onSubmit={handleSubmit}>
        <label htmlFor="eventTitle">Title:</label>
        <input
          type="text"
          id="eventTitle"
          name="eventTitle"
          value={formData.eventTitle}
          onChange={handleChange}
          required
        />

        <label htmlFor="eventDescription">Description:</label>
        <textarea
          id="eventDescription"
          name="eventDescription"
          value={formData.eventDescription}
          onChange={handleChange}
          required
        />

        <label htmlFor="eventDate">Date & Time:</label>
        <input
          type="datetime-local"
          id="eventDate"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          required
        />

        <label htmlFor="eventLocation">Location:</label>
        <input
          type="text"
          id="eventLocation"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
          required
        />

        <label htmlFor="eventOrganization">Organization:</label>
        <input
          type="text"
          id="eventOrganization"
          name="eventOrganization"
          value={formData.eventOrganization}
          onChange={handleChange}
          required
        />

        <label htmlFor="eventCapacity">Capacity:</label>
        <input
          type="number"
          id="eventCapacity"
          name="eventCapacity"
          value={formData.eventCapacity}
          onChange={handleChange}
          min="1"
          required
        />

        <label htmlFor="eventCategory">Category:</label>
        <input
          type="text"
          id="eventCategory"
          name="eventCategory"
          value={formData.eventCategory}
          onChange={handleChange}
          required
        />

        <label htmlFor="ticketType">Ticket Type:</label>
        <select
          id="ticketType"
          name="ticketType"
          value={formData.ticketType}
          onChange={handleChange}
        >
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <button type="submit">{editEventId ? "Update Event" : "Create Event"}</button>
      </form>

      <h2>Your Events</h2>
      <div className="user-events">
        {userEvents.length === 0 ? (
          <p>No events created yet.</p>
        ) : (
          userEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.eventTitle}</h3>
              <p>{event.eventDescription}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.eventDate.seconds * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Location:</strong> {event.eventLocation}
              </p>
              <div className="event-buttons">
                <button onClick={() => handleEdit(event)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventCreation;