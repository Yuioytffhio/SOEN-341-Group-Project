import React, { useEffect, useState } from "react";
import "./AnalyticsOrg.css";
import { auth, db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

const EventAnalytics = () => {
  // list with metrics
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // full event doc
  const [selectedEvent, setSelectedEvent] = useState(null);
  // ticket docs for selected event
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Helper to fetch tickets for a specific eventId
  const fetchTicketsForEvent = async (eventId) => {
    const ticketsRef = collection(db, "tickets");
    const q = query(ticketsRef, where("eventId", "==", eventId));
    const snap = await getDocs(q);
    const tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return tickets;
  };

  // Load all events and compute attendance rate for each created event
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!mounted) return;

      if (user) {
        try {
          const eventsRef = collection(db, "events");
          const q = query(eventsRef, where("createdBy", "==", user.uid));
          const eventsSnap = await getDocs(q);

          const eventsData = await Promise.all(
            eventsSnap.docs.map(async (doc) => {
              const data = doc.data();
              const id = doc.id;
              const tickets = await fetchTicketsForEvent(id);
              const ticketsIssued = tickets.length;
              const eventCapacity = Number(data.eventCapacity) || 0;

              const confirmedTickets = tickets.filter(
                (t) => t.status === "confirmed"
              ).length;
              const attendanceRate =
                ticketsIssued > 0
                  ? Math.min((confirmedTickets / ticketsIssued) * 100, 100)
                  : 0;

              const remainingCapacity = Math.max(
                eventCapacity - ticketsIssued,
                0
              );

              return {
                id,
                ...data,
                ticketsIssued,
                eventCapacity,
                attendanceRate,
                remainingCapacity,
              };
            })
          );

          // Sort by date
          eventsData.sort((a, b) => {
            const da =
              a.eventDate instanceof Timestamp
                ? a.eventDate.toDate()
                : new Date(a.eventDate);
            const dbd =
              b.eventDate instanceof Timestamp
                ? b.eventDate.toDate()
                : new Date(b.eventDate);
            return da - dbd;
          });

          setEvents(eventsData);
          setError(null);
        } catch (err) {
          console.error("Failed to load events:", err);
          setError("Failed to load events.");
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        // User is not signed in
        if (mounted) {
          setEvents([]);
          setError("User not logged in.");
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const openEventDetail = async (eventObj) => {
    setSelectedEvent(eventObj);
    setSelectedTickets([]);
    setDetailLoading(true);
    try {
      const tickets = await fetchTicketsForEvent(eventObj.id);
      tickets.sort((a, b) => {
        const da = a.ticketdate
          ? new Date(
              a.ticketdate.seconds ? a.ticketdate.toDate() : a.ticketdate
            )
          : 0;
        const db = b.ticketdate
          ? new Date(
              b.ticketdate.seconds ? b.ticketdate.toDate() : b.ticketdate
            )
          : 0;
        return db - da;
      });
      setSelectedTickets(tickets);
    } catch (err) {
      console.error("Failed to load tickets for event:", err);
      setSelectedTickets([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedEvent(null);
    setSelectedTickets([]);
  };

  return (
    <div className="analytics-page">
      <h1>Event Analytics</h1>

      {loading && <div className="info">Loading events...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !selectedEvent && (
        <>
          {events.length === 0 ? (
            <div className="info">No events found.</div>
          ) : (
            <div className="events-grid">
              {events.map((evt) => (
                <div
                  className="event-card"
                  key={evt.id}
                  onClick={() => openEventDetail(evt)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-header">
                    <h2 className="card-title">
                      {evt.eventTitle || "Untitled Event"}
                    </h2>
                    <div className="card-sub">
                      {evt.eventOrganization || ""}
                      {evt.eventDate ? (
                        <div className="event-date">
                          {evt.eventDate instanceof Timestamp
                            ? evt.eventDate.toDate().toLocaleString()
                            : new Date(evt.eventDate).toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="metric-row">
                      <div className="metric">
                        <div className="metric-label">Tickets Issued</div>
                        <div className="metric-value">{evt.ticketsIssued}</div>
                      </div>

                      <div className="metric">
                        <div className="metric-label">Attendance Rate</div>
                        <div className="metric-value">
                          {evt.ticketsIssued > 0
                            ? `${evt.attendanceRate.toFixed(1)}%`
                            : "—"}
                        </div>
                      </div>

                      <div className="metric">
                        <div className="metric-label">Remaining</div>
                        <div className="metric-value">
                          {evt.remainingCapacity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <small>Click for details</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail view */}
      {selectedEvent && (
        <div className="event-detail">
          <button className="back-button" onClick={closeDetail}>
            ← Back to events
          </button>

          <div className="event-detail-header">
            <div>
              <h2>{selectedEvent.eventTitle || "Untitled Event"}</h2>
              <p className="muted">
                {selectedEvent.eventOrganization || ""} •{" "}
                {selectedEvent.eventLocation || ""}
              </p>
              {selectedEvent.eventDate ? (
                <p className="muted">
                  {selectedEvent.eventDate instanceof Timestamp
                    ? selectedEvent.eventDate.toDate().toLocaleString()
                    : new Date(selectedEvent.eventDate).toLocaleString()}
                </p>
              ) : null}
            </div>

            <div className="detail-metrics">
              <div className="detail-metric">
                <div className="label">Capacity</div>
                <div className="value">{selectedEvent.eventCapacity}</div>
              </div>
              <div className="detail-metric">
                <div className="label">Tickets Issued</div>
                <div className="value">{selectedEvent.ticketsIssued}</div>
              </div>
              <div className="detail-metric">
                <div className="label">Attendance Rate</div>
                <div className="value">
                  {selectedEvent.ticketsIssued > 0
                    ? `${selectedEvent.attendanceRate.toFixed(1)}%`
                    : "—"}
                </div>
              </div>
              <div className="detail-metric">
                <div className="label">Remaining</div>
                <div className="value">{selectedEvent.remainingCapacity}</div>
              </div>
            </div>
          </div>

          <div className="tickets-section">
            <h3>Tickets ({selectedTickets.length})</h3>

            {detailLoading ? (
              <div className="info">Loading tickets...</div>
            ) : selectedTickets.length === 0 ? (
              <div className="info">No tickets found for this event.</div>
            ) : (
              <div className="tickets-table-wrap">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Student ID</th>
                      <th>Status</th>
                      <th>Ticket Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTickets.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.studentID || t.studentId || "-"}</td>
                        <td>{t.status || "-"}</td>
                        <td>
                          {t.ticketdate
                            ? t.ticketdate.seconds
                              ? new Date(t.ticketdate.toDate()).toLocaleString()
                              : new Date(t.ticketdate).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="note muted">
            Note: "Attendance Rate" = confirmed tickets ÷ total tickets issued.
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAnalytics;
