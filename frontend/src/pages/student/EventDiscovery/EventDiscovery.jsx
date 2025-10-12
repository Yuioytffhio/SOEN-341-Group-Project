import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";
import { limit, collection, query, where, getDocs, getFirestore, doc, setDoc } from "firebase/firestore";

const GENERATION_OFFSET = new Date('5000-01-01').getTime();
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//ID Generator//
const generateId = () => {
    let autoId = '';
    for (let i = 0; i < 10; i++) {
        autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return (GENERATION_OFFSET - Date.now()).toString(32) + autoId;
};

//Trigram Generator//
export const triGram = txt => {
    const map = {};
    const s1 = (txt || '').toLowerCase();
    const n = 3;
    for (let k = 0; k <= s1.length - n; k++) map[s1.substring(k, k + n)] = true;
    return map;
};

//Add Event to Firestore with Trigram Search
export const addPost = async (docData) => {
    const db = getFirestore();
    const id = generateId();
    const payload = {
        ...docData,
        ...triGram([docData.title || '', docData.desc || ''].join(' ').slice(0, 500))
    };

    const postRef = doc(db, 'posts', id);
    await setDoc(postRef, payload);
};

//Firestore Search//
const searchEvents = async (searchTxt) => {
    const db = getFirestore();
    const searchConstraints = [];

    triGram(searchTxt).forEach(name =>
        searchConstraints.push(where(`_smeta.${name}`, '==', true))
    );
    let constraints = [
        collection(db, 'posts'),
        where('postType', '==', 'event'),
        where('visibility', '==', 'public'),
        ...searchConstraints,
        limit(5)
    ];

    const q = query(...constraints);
    const querySnapshot = await getDocs(q);
    const results = [];

    querySnapshot.forEach(doc => results.push({ _id: doc.id, ...doc.data() }));
    return results;
};

function EventDiscovery() {
  const [events, setEvents] = useState([]);

  // Filter & Search
  const [filters, setFilters] = useState({
    searchKeyword: "",
    category: "",
    organization: "",
    date: ""
  });

  /* To fetch data from backend */
  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch events");
        return response.json();
      })
      .then(data => setEvents(data))
      .catch(error => console.error("Error fetching events:", error));
  }, []);

  // Apply filters
  useEffect(() => {
     const { searchKeyword } = filters;
      if (searchKeyword) {
          searchEvents(searchKeyword).then(results => {
              setEvents(results); // Update the events based on search result
          }).catch(err => console.error("Search error:", err));
      }
  }, [filters]);

  const filteredEvents = events.filter(event => {
    const matchCategory =
      !filters.category || event.eventCategory === filters.category;
    const matchOrg =
      !filters.organization || event.eventOrganization === filters.organization;
    const matchDate =
      !filters.date || event.eventDate?.slice(0, 10) === filters.date;

  // Keyword search filtering
  const matchSearchKeyword =
      !filters.searchKeyword ||
      event.eventTitle.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
      event.eventDescription.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
      event.eventLocation.toLowerCase().includes(filters.searchKeyword.toLowerCase());

    return matchCategory && matchOrg && matchDate && matchSearchKeyword;
  });

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>
      {/* Added filters */}
      <div className="filter-bar">
      {/* Search bar */}
      <input
         type="text"
         placeholder="Search events"
         value={filters.searchKeyword}
         onChange={e => setFilters({ ...filters, searchKeyword: e.target.value })}
         className="search-input"
      />


          <select
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Sports">Sports</option>
          <option value="Arts">Arts</option>
          <option value="Sports">Sports</option>
          <option value="Anthropology">Anthropology</option>
        </select>

        <select
          value={filters.organization}
          onChange={e => setFilters({ ...filters, organization: e.target.value })}
        >
          <option value="">All Organizations</option>
          <option value="Computer Science Department">Computer Science Department</option>
          <option value="Space Concordia">Space Concordia</option>
          <option value="Concordia Rugby">Concordia Rugby</option>
          <option value="Fine Arts Department">Fine Arts Department</option>
          <option value="F1 Club">F1 Club</option>
          <option value="Anthropology Club">Anthropology Club</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={e => setFilters({ ...filters, date: e.target.value })}
        />

      </div>

      {/* Events list */}
      <div className="events-row">
        {filteredEvents.length === 0 ? (
          <p>No events available.</p>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id || event.eventId} className="event-card">
              <img
                src={event.imageUrl ? event.imageUrl : GetTogether}
                alt={event.eventTitle}
                className="event-card-image"
              />
              <div className="event-card-info">
                <h2>{event.eventTitle}</h2>
                <p className="event-card-desc">{event.eventDescription}</p>
                <p className="event-card-date">{event.eventDate}</p>
                <p className="event-card-location">{event.eventLocation}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;
