import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";
import { auth, db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
  query,
  where,
} from "firebase/firestore";
import QRCode from "qrcode";

function EventDiscovery() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    organization: "",
    date: "",
    ticketType: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsList = querySnapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            eventDate: data.eventDate?.seconds
              ? new Date(data.eventDate.seconds * 1000)
              : data.eventDate
              ? new Date(data.eventDate)
              : null,
          };
        });
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const getNextTicketId = async () => {
    const ticketsRef = collection(db, "tickets");
    const ticketsSnap = await getDocs(ticketsRef);
    const count = ticketsSnap.size + 1;
    return `tk_${String(count).padStart(6, "0")}`;
  };

  const getStudentId = async (user) => {
    if (!user || !user.uid) {
      console.error("No logged-in user found");
      return null;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        console.log("Found existing student →", userDoc.id);
        return userDoc.id; // e.g. st_000015
      } else {
        console.error("No Firestore user found for UID:", user.uid);
        alert("User not found in database. Please contact support.");
        return null;
      }
    } catch (err) {
      console.error("🔥 Error fetching student:", err);
      return null;
    }
  };

  const handleBook = async (event) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save an event.");
      return;
    }

    try {
      const studentID = await getStudentId(user);
      if (!studentID) return;

      const ticketsRef = collection(db, "tickets");
      console.log("Debug before query → event.id:", event.id, "studentID:", studentID);
      const q = query(
        ticketsRef,
        where("eventId", "==", event.id),
        where("studentID", "==", studentID)
      );
      const existingTickets = await getDocs(q);
      if (!existingTickets.empty) {
        alert("You already saved this event!");
        return;
      }

      const eventRef = doc(db, "events", event.id);
      const eventSnap = await getDoc(eventRef);
      if (!eventSnap.exists()) {
        alert("Event not found.");
        return;
      }
      const currentCapacity = eventSnap.data().eventCapacity;
      if (currentCapacity <= 0) {
        alert("Sorry, this event is full!");
        return;
      }

      await updateDoc(eventRef, { eventCapacity: increment(-1) });

      const qrText = `Event: ${event.eventTitle}\nStudent: ${studentID}\nDate: ${new Date().toISOString()}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrText);

      const newTicketId = await getNextTicketId();

      await setDoc(doc(db, "tickets", newTicketId), {
        eventId: event.id,
        eventTitle: event.eventTitle,
        studentID,
        status: "confirmed",
        ticketDate: new Date(),
        qrCode: qrCodeDataURL,
      });

      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === event.id ? { ...e, eventCapacity: e.eventCapacity - 1 } : e
        )
      );

      alert(`Ticket created successfully for ${studentID}!`);
    } catch (error) {
      console.error("Detailed error creating ticket:", error);
      console.error("Error message:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchCategory =
      !filters.category || event.eventCategory === filters.category;
    const matchOrg =
      !filters.organization ||
      event.eventOrganization === filters.organization;
    const matchDate =
      !filters.date ||
      (event.eventDate &&
        event.eventDate.toISOString().slice(0, 10) === filters.date);
    const matchTicket =
      !filters.ticketType ||
      (filters.ticketType === "free" &&
        (!event.ticketType || event.ticketType.toLowerCase() === "free")) ||
      (filters.ticketType === "paid" &&
        event.ticketType &&
        event.ticketType.toLowerCase() === "paid");

    return matchCategory && matchOrg && matchDate && matchTicket;
  });

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>

      {/* Filter bar */}
      <div className="filter-bar">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Sports">Sports</option>
          <option value="Arts">Arts</option>
          <option value="Anthropology">Anthropology</option>
        </select>

        <select
          value={filters.organization}
          onChange={(e) =>
            setFilters({ ...filters, organization: e.target.value })
          }
        >
          <option value="">All Organizations</option>
          <option value="Computer Science Department">
            Computer Science Department
          </option>
          <option value="Space Concordia">Space Concordia</option>
          <option value="Concordia Rugby">Concordia Rugby</option>
          <option value="Fine Arts Department">Fine Arts Department</option>
          <option value="F1 Club">F1 Club</option>
          <option value="Anthropology Club">Anthropology Club</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        <select
          value={filters.ticketType}
          onChange={(e) =>
            setFilters({ ...filters, ticketType: e.target.value })
          }
        >
          <option value="">All Ticket Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Events list */}
      <div className="events-row">
        {filteredEvents.length === 0 ? (
          <p>No events available.</p>
        ) : (
          filteredEvents.map((event) => {
            const formattedDate = event.eventDate
              ? event.eventDate.toISOString().slice(0, 10)
              : "Date TBD";

            return (
              <div key={event.id} className="event-card">
                <img
                  src={event.imageUrl || GetTogether}
                  alt={event.eventTitle}
                  className="event-card-image"
                />
                <div className="event-card-info">
                  <h2>{event.eventTitle}</h2>
                  <p className="event-card-desc">{event.eventDescription}</p>
                  <p className="event-card-date">{formattedDate}</p>
                  <p className="event-card-location">{event.eventLocation}</p>
                  <p
                    className="event-card-ticketType"
                    data-type={event.ticketType?.toLowerCase() || "free"}
                  >
                    {event.ticketType
                      ? event.ticketType.charAt(0).toUpperCase() +
                        event.ticketType.slice(1)
                      : "Free"}
                  </p>
                  <p
                    className={`event-capacity ${
                      event.eventCapacity <= 0 ? "sold-out" : ""
                    }`}
                  >
                    {`${Math.max(event.eventCapacity, 0)} spot${
                      event.eventCapacity === 1 ? "" : "s"
                    } left`}
                  </p>
                </div>

                {event.eventCapacity > 0 ? (
                  <button
                    className="save-btn"
                    onClick={() => handleBook(event)}
                  >
                    Save Event
                  </button>
                ) : (
                  <button className="save-btn soldout-btn" disabled>
                    Sold Out
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;
