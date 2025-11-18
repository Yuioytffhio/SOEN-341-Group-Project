import { useState, useEffect, useRef } from "react";
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
    eventTime: "",
    eventDuration: "",
    eventLocation: "",
    eventCapacity: "",
    eventCategory: "",
    eventOrganization: "",
    ticketType: "free",
    price: "",
    locationLat: "",
    locationLng: "",
  });

  const [errors, setErrors] = useState({});
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [isLocationValid, setIsLocationValid] = useState(false);

  const [userEvents, setUserEvents] = useState([]);
  const [editEventId, setEditEventId] = useState(null);

  const searchTimeoutRef = useRef(null);

  // ========================================
  // HANDLE NORMAL INPUT CHANGE
  // ========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (value.trim() === "" && value.length > 0) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ========================================
  // LOCATION AUTOCOMPLETE (QUEBEC ONLY)
  // ========================================
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setIsLocationValid(false);
    setErrors((prev) => ({ ...prev, eventLocation: null }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length < 3) {
      setLocationResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&countrycodes=ca&limit=5&viewbox=-79.7624,62,-57.1056,44.9914&bounded=1`
        );
        const data = await res.json();
        setLocationResults(data);
      } catch {
        setLocationResults([]);
      }
    }, 300);
  };

  const selectLocation = (loc) => {
    setLocationQuery(loc.display_name);
    setFormData((prev) => ({
      ...prev,
      eventLocation: loc.display_name,
      locationLat: loc.lat,
      locationLng: loc.lon,
    }));
    setIsLocationValid(true);
    setLocationResults([]);
    setErrors((prev) => ({ ...prev, eventLocation: null }));
  };

  // ========================================
  // FETCH USER EVENTS
  // ========================================
  const fetchUserEvents = async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "events"),
      where("createdBy", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    setUserEvents(
      querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  };

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        e.target.name !== "eventLocation"
      ) {
        setLocationResults([]); // close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // ========================================
  // EDIT EVENT
  // ========================================
  const handleEdit = (event) => {
    const fullDate = new Date(event.eventDate.seconds * 1000);

    setFormData({
      eventTitle: event.eventTitle || "",
      eventDescription: event.eventDescription || "",
      eventDate: fullDate.toISOString().split("T")[0],
      eventTime: fullDate.toTimeString().slice(0, 5),
      eventDuration: event.eventDuration?.toString() || "",
      eventLocation: event.eventLocation || "",
      locationLat: event.locationLat || "",
      locationLng: event.locationLng || "",
      eventCapacity: event.eventCapacity?.toString() || "",
      eventCategory: event.eventCategory || "",
      eventOrganization: event.eventOrganization || "",
      ticketType: event.ticketType || "free",
      price: event.price?.toString() || "",
    });

    setLocationQuery(event.eventLocation || "");
    setIsLocationValid(true);
    setErrors({});
    setEditEventId(event.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ========================================
  // DELETE EVENT
  // ========================================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
      alert("Event deleted!");
      fetchUserEvents();
    }
  };

  // ========================================
  // SUBMIT EVENT
  // ========================================
  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    // Sync location
    formData.eventLocation = locationQuery;

    // VALIDATION
    let newErrors = {};

    const requiredFields = [
      "eventTitle",
      "eventDescription",
      "eventDate",
      "eventTime",
      "eventDuration",
      "eventLocation",
      "eventCapacity",
      "eventCategory",
      "eventOrganization",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "Mendatory field";
      }
    });

    if (!isLocationValid) {
      newErrors.eventLocation = "Please select a location.";
    }

    if (formData.ticketType === "paid") {
      if (!formData.price || Number(formData.price) <= 0) {
        newErrors.price = "Enter a valid price.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isLocationValid) {
      setErrors((prev) => ({
        ...prev,
        eventLocation: "Please select a valid location from suggestions."
      }));
      return;
    }


    setErrors({});

    // DATE VALIDATION
    const selectedDate = new Date(
      `${formData.eventDate}T${formData.eventTime}`
    );

    const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDateOnly = new Date(formData.eventDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly < today) {
        setErrors({ eventDate: "Date cannot be before today." });
        return;
      }


    const hour = selectedDate.getHours();
    if (hour < 9 || hour > 21) {
      setErrors({ eventTime: "Event must be between 9 AM and 9 PM." });
      return;
    }

    try {
      // UPDATE
      if (editEventId) {
        await updateDoc(doc(db, "events", editEventId), {
          ...formData,
          eventDate: Timestamp.fromDate(selectedDate),
          eventCapacity: Number(formData.eventCapacity),
          eventDuration: Number(formData.eventDuration),
          updatedAt: serverTimestamp(),
        });

        alert("Event updated successfully!");
        setEditEventId(null);
      }

      // CREATE
      else {
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);

        let maxIndex = 0;
        eventsSnapshot.forEach((docu) => {
          const id = docu.id;
          if (id.startsWith("eventId_")) {
            const idx = parseInt(id.replace("eventId_", ""));
            if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
          }
        });

        const newId = `eventId_${String(maxIndex + 1).padStart(3, "0")}`;

        await setDoc(doc(eventsCollection, newId), {
          ...formData,
          eventDate: Timestamp.fromDate(selectedDate),
          eventCapacity: Number(formData.eventCapacity),
          eventDuration: Number(formData.eventDuration),
          locationDisplay: formData.eventLocation,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid || null,
        });

        alert("Event created successfully!");
      }

      // RESET
      setFormData({
        eventTitle: "",
        eventDescription: "",
        eventDate: "",
        eventTime: "",
        eventDuration: "",
        eventLocation: "",
        locationLat: "",
        locationLng: "",
        eventCapacity: "",
        eventCategory: "",
        eventOrganization: "",
        ticketType: "free",
        price: "",
      });

      setLocationQuery("");
      setIsLocationValid(false);
      fetchUserEvents();
    } catch {
      alert("Error saving event.");
    }
  };

  // ========================================
  // RETURN UI
  // ========================================
  return (
    <div className="ec-eventcreation-fullpage">
      <div className="ec-event-form-card">
        <h1>Create Event</h1>

        {/* EVENT TITLE */}
        <div className="ec-form-group">
          <label>Event Name</label>
          <input
            type="text"
            name="eventTitle"
            value={formData.eventTitle}
            onChange={handleChange}
            className={errors.eventTitle ? "ec-input-error" : ""}
          />
          {errors.eventTitle && (
            <div className="ec-error-text">{errors.eventTitle}</div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="ec-form-group textarea-wrapper">
          <label>Description</label>
          <div className="ec-textarea-container">
            <textarea
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleChange}
              maxLength={250}
              className={errors.eventDescription ? "ec-input-error" : ""}
            />
            <span className="ec-char-counter-inside">
              {formData.eventDescription.length}/250
            </span>
          </div>
          {errors.eventDescription && (
            <div className="ec-error-text">{errors.eventDescription}</div>
          )}
        </div>

        {/* DATE / TIME / DURATION */}
        <div className="ec-form-row">
          {/* DATE */}
          <div className="ec-form-group">
            <label>Date</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className={errors.eventDate ? "ec-input-error" : ""}
              min={new Date().toISOString().split("T")[0]}   // <— THIS LINE
            />
            {errors.eventDate && (
              <div className="ec-error-text">{errors.eventDate}</div>
            )}
          </div>

          {/* TIME */}
          <div className="ec-form-group">
            <label>Time</label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              className={errors.eventTime ? "ec-input-error" : ""}
            />
            {errors.eventTime && (
              <div className="ec-error-text">{errors.eventTime}</div>
            )}
          </div>

          {/* DURATION */}
          <div className="ec-form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              name="eventDuration"
              value={formData.eventDuration}
              onChange={handleChange}
              className={errors.eventDuration ? "ec-input-error" : ""}
            />
            {errors.eventDuration && (
              <div className="ec-error-text">{errors.eventDuration}</div>
            )}
          </div>
        </div>

        {/* LOCATION */}
        <div className="ec-form-group">
          <label>Location</label>
          <input
            type="text"
            value={locationQuery}
            onChange={handleLocationChange}
            className={errors.eventLocation ? "ec-input-error" : ""}
            autoComplete="off"
          />
          {errors.eventLocation && (
            <div className="ec-error-text">{errors.eventLocation}</div>
          )}

          {locationResults.length > 0 && (
            <div ref={dropdownRef} className="ec-dropdown-location">
              {locationResults.map((loc) => (
                <div
                  key={loc.place_id}
                  className="ec-dropdown-item"
                  onClick={() => selectLocation(loc)}
                >
                  {loc.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY */}
        <div className="ec-form-group">
          <label>Category</label>
          <input
            type="text"
            name="eventCategory"
            value={formData.eventCategory}
            onChange={handleChange}
            className={errors.eventCategory ? "ec-input-error" : ""}
          />
          {errors.eventCategory && (
            <div className="ec-error-text">{errors.eventCategory}</div>
          )}
        </div>

        {/* ORGANIZATION */}
        <div className="ec-form-group">
          <label>Organization</label>
          <input
            type="text"
            name="eventOrganization"
            value={formData.eventOrganization}
            onChange={handleChange}
            className={errors.eventOrganization ? "ec-input-error" : ""}
          />
          {errors.eventOrganization && (
            <div className="ec-error-text">{errors.eventOrganization}</div>
          )}
        </div>

        {/* CAPACITY */}
        <div className="ec-form-group">
          <label>Capacity</label>
          <input
            type="number"
            min="1"
            name="eventCapacity"
            value={formData.eventCapacity}
            onChange={handleChange}
            className={errors.eventCapacity ? "ec-input-error" : ""}
          />
          {errors.eventCapacity && (
            <div className="ec-error-text">{errors.eventCapacity}</div>
          )}
        </div>

        {/* TICKET TYPE */}
        <div className="ec-form-group">
          <label>Ticket Type</label>
          <select
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            className={errors.ticketType ? "ec-input-error" : ""}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          {errors.ticketType && (
            <div className="ec-error-text">{errors.ticketType}</div>
          )}
        </div>

        {/* PRICE (PAID ONLY) */}
        {formData.ticketType === "paid" && (
          <div className="ec-form-group">
            <label>Ticket Price (CAD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? "ec-input-error" : ""}
            />
            {errors.price && (
              <div className="ec-error-text">{errors.price}</div>
            )}
          </div>
        )}

        {/* BUTTON */}
        <button className="ec-submit-button" onClick={handleSubmit}>
          {editEventId ? "Update Event" : "Create Event"}
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="ec-eventcreation-right">
        <h2>Your Events</h2>

        <div className="ec-event-list">
          {userEvents.length === 0 ? (
            <p>No events created yet.</p>
          ) : (
            userEvents.map((event) => {
              const date = new Date(event.eventDate.seconds * 1000);

              return (
                <div key={event.id} className="ec-event-card">
                  <h3>{event.eventTitle}</h3>
                  <p>{event.eventDescription}</p>
                  <p>
                    <strong>Date:</strong> {date.toLocaleString()}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.eventLocation}
                  </p>

                  <div className="ec-event-buttons">
                    <button className="ec-edit-btn" onClick={() => handleEdit(event)}>
                      Edit
                    </button>
                    <button className="ec-delete-btn" onClick={() => handleDelete(event.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCreation;
