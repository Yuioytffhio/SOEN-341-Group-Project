import { useEffect, useState } from "react";
import MockPayment from "../../../components/mockPayment/mockPayment";
import "./EventDiscovery.css";
import "leaflet/dist/leaflet.css";
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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, DivIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

const pin_icon = new Icon({
    // iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconUrl: require("../../../assets/map_pin.png"),
    iconSize: [38, 38] // size of the icon
});

const cluster_icon = function (cluster) {
    return new DivIcon({
        html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
        className: "custom-marker-cluster",
        iconSize: point(33, 33, true)
    });
};

function EventDiscovery() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    organization: "",
    date: "",
    ticketType: "",
    title: "",
  });

  const [categories, setCategories] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);


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
            eventLatitude: data.eventLatitude,
            eventLongitude: data.eventLongitude,
          };
        });

        setEvents(eventsList);

        const uniqueCategories = [
          ...new Set(eventsList.map((e) => e.eventCategory).filter(Boolean)),
        ];
        const uniqueOrganizations = [
          ...new Set(
            eventsList.map((e) => e.eventOrganization).filter(Boolean)
          ),
        ];
        const uniqueTicketTypes = [
          ...new Set(eventsList.map((e) => e.ticketType).filter(Boolean)),
        ];

        setCategories(uniqueCategories);
        setOrganizations(uniqueOrganizations);
        setTicketTypes(uniqueTicketTypes);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const getNextTicketId = () => {
    const now = Date.now(); 
    const uniquePart = (now % 1000000).toString().padStart(6, "0");
    return `tk_${uniquePart}`;
  };


  const getStudentId = async (user) => {
    if (!user || !user.uid) return null;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) return querySnap.docs[0].id;
      alert("User not found in database. Please contact support.");
      return null;
    } catch (err) {
      console.error("Error fetching student:", err);
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

      // Check if user already has a ticket for this event
    const ticketsRef = collection(db, "tickets");
    const ticketQuery = query( ticketsRef, where("eventId", "==", event.id),
      where("studentID", "==", studentID));
    const existingTicketSnap = await getDocs(ticketQuery);
    
    if (!existingTicketSnap.empty) {
      alert("You already have a ticket for this event!");
      return;
    }

    // Otherwise, proceed to create one
    await updateDoc(eventRef, { eventCapacity: increment(-1) });

    const newTicketId = getNextTicketId(); 
    const qrValue = `${newTicketId}_${studentID}_${event.id}`; 
    const qrCodeImage = await QRCode.toDataURL(qrValue);

    await setDoc(doc(db, "tickets", newTicketId), {
      ticketId: newTicketId,
      eventId: event.id,
      eventTitle: event.eventTitle,
      studentID,
      status: "pending",
      ticketDate: new Date(),
      qrCodeValue: qrValue,  
      qrCodeImage: qrCodeImage,
  });

  setEvents((prev) =>
    prev.map((e) => e.id === event.id ? { ...e, eventCapacity: e.eventCapacity - 1 }: e )
  );

  alert(`New ticket created successfully: ${newTicketId}`);
    } catch (error) {
        console.error("Error creating ticket:", error);
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
      (event.ticketType &&
        event.ticketType.toLowerCase() === filters.ticketType.toLowerCase());
    const matchSearch =
       !filters.title ||
       (event.eventTitle &&
         event.eventTitle.toLowerCase().includes(filters.title.toLowerCase()));


      return matchCategory && matchOrg && matchDate && matchTicket && matchSearch;
  });

  return (
    <div className="st-event-discovery p-6">
      <h1 className="st-event-Title">Event Discovery</h1>

        {/* Map */}
        <MapContainer center={[45.4950726763264, -73.577855699083]} zoom={18} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading iconCreateFunction={cluster_icon}>
                {/* Markers */}
                {events.map((event) =>
                    !isNaN(event.eventLatitude) &&
                    !isNaN(event.eventLongitude) ? (
                        <Marker position={[event.eventLatitude, event.eventLongitude]} icon={pin_icon}>
                            <Popup>
                                <div
                                    style={{ cursor: "pointer", color: "#1a73e8", fontWeight: "bold" }}
                                    onClick={() =>
                                        window.open(`https://www.google.com/maps?q=${event.eventLatitude},${event.eventLongitude}`)
                                    }
                                >
                                    {event.eventLocation}
                                </div>
                            </Popup>
                        </Marker>
                    ) : null)}
            </MarkerClusterGroup>
      </MapContainer>

      {/* Search Bar */}
        <div className="st-search-bar">
            <input
                type="text"
                placeholder="Title"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
        </div>


        {/* Dynamic Filter Bar */}
      <div className="st-filter-bar">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Organization */}
        <select
          value={filters.organization}
          onChange={(e) =>
            setFilters({ ...filters, organization: e.target.value })
          }
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        {/* Date */}
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
          {ticketTypes.map((type) => (
            <option key={type} value={type.toLowerCase()}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="st-events-row">
        {filteredEvents.length === 0 ? (
          <p>No events available.</p>
        ) : (
          filteredEvents.map((event) => {
            const formattedDate = event.eventDate
              ? event.eventDate.toISOString().slice(0, 10)
              : "Date TBD";

            return (
              <div key={event.id} className="st-event-card">
                <img
                  src={event.imageUrl || GetTogether}
                  alt={event.eventTitle}
                  className="st-event-card-image"
                />
                <div className="st-event-card-info">
                  <h2>{event.eventTitle}</h2>
                  <p className="st-event-card-desc">{event.eventDescription}</p>
                  <p className="st-event-card-date">{formattedDate}</p>
                  <p className="st-event-card-location">{event.eventLocation}</p>
                  <p className="st-event-card-ticketType" data-type={event.ticketType?.toLowerCase() || "free"} >
                    {event.ticketType === "paid" ? `$${event.price || 0}` : "Free"}
                  </p>

                  <p
                    className={`st-event-capacity ${
                      event.eventCapacity <= 0 ? "sold-out" : ""
                    }`}
                  >
                    {`${Math.max(event.eventCapacity, 0)} spot${
                      event.eventCapacity === 1 ? "" : "s"
                    } left`}
                  </p>
                </div>

                {event.eventCapacity > 0 ? ( event.ticketType === "paid" ? 
                ( <button className="st-save-btn st-paid-btn" onClick={() => setSelectedEvent(event)} >
                  Buy Ticket
                  </button> ) : ( <button className="st-save-btn" onClick={() => handleBook(event)} >
                  Save Event
                  </button> ) ) : ( <button className="st-save-btn st-soldout-btn" disabled>
                  Sold Out
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedEvent && (
        <MockPayment event={selectedEvent} onSuccess={(event) => {
        handleBook(event);
        setSelectedEvent(null);
          }
        }
        onCancel={() => setSelectedEvent(null)} />
      )
      }

     </div>
  );
}

export default EventDiscovery;
