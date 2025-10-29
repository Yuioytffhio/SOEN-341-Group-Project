import { useState } from "react";
import "./EventCreation.css";

import { auth, db } from "../../../firebaseConfig";
import { collection, setDoc, doc, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    try {
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

    } catch (error) {
      console.error("Error adding event:", error);
      alert("There was an error creating the event. Please try again.");
    }
  };

  return (
<div className="eventcreation-page">
  <h1>Create an Event</h1>

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

    <button type="submit">Create Event</button>
  </form>
</div>
  );
};

export default EventCreation;