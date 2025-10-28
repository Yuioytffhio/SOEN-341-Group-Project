import { useState } from "react";
import "./EventCreation.css";

import { auth, db } from "../../../firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

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
      const eventsRef = collection(db, "events");

      await addDoc(eventsRef, {
        eventTitle: formData.eventTitle,
        eventDescription: formData.eventDescription,
        eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
        eventLocation: formData.eventLocation,
        eventCapacity: Number(formData.eventCapacity),
        eventCategory: formData.eventCategory,
        eventOrganization: formData.eventOrganization,
        ticketType: formData.ticketType,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser ? auth.currentUser.uid : null,
      });

      alert("The event was successfully created!");
      console.log("Event created:", formData);


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
        <label>
          Title:
          <input
            type="text"
            name="eventTitle"
            value={formData.eventTitle}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="eventDescription"
            value={formData.eventDescription}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date & Time:
          <input
            type="datetime-local"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Location:
          <input
            type="text"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Organization:
          <input
            type="text"
            name="eventOrganization"
            value={formData.eventOrganization}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Capacity:
          <input
            type="number"
            name="eventCapacity"
            value={formData.eventCapacity}
            onChange={handleChange}
            min="1"
            required
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            name="eventCategory"
            value={formData.eventCategory}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Ticket Type:
          <select
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventCreation;
