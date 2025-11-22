import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; 
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import "./AnalyticsAdmin.css";

const Analytics = () => {
  const [eventCount, setEventCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // fetching all events 
        const eventsRef = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsRef);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let totalEvents = eventsSnapshot.size;

        // fetching all tickets
        let totalTickets = 0;
        const ticketsRef = collection(db, "tickets");
        const ticketsSnapshot = await getDocs(ticketsRef);
        const ticketsData = ticketsSnapshot.docs.map((doc) => doc.data());

        totalTickets = ticketsSnapshot.size;

        // Count how many tickets per event
        const participantsCount = {};
        ticketsData.forEach((ticket) => {
          if (ticket.eventId) {
            participantsCount[ticket.eventId] = (participantsCount[ticket.eventId] || 0) + 1;
          }
        });

        // Prepare trend data for chart
        const trendList = eventsData.map((event) => ({
          name: event.eventTitle || "Unnamed Event",
          participants: participantsCount[event.id] || 0,
        }));

        setEventCount(totalEvents);
        setTicketCount(totalTickets);
        setTrendData(trendList);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="admin-analytics-loading">Loading analytics...</p>;

  return (
    <div className="admin-analytics-page">
      <div className="admin-analytics-left-space">
        <header className="admin-analytics-header">
          <h2 className="admin-analytics-title">Global Statistics</h2>
        </header>

        <div className="admin-analytics-cards">
          <div className="admin-analytics-card">
            <h3>Total Events</h3>
            <p>{eventCount}</p>
          </div>
          <div className="admin-analytics-card">
            <h3>Tickets Issued</h3>
            <p>{ticketCount}</p>
          </div>
        </div>

      </div>
      <div className="admin-analytics-right-space">
        
        <div className="admin-analytics-chart">
          <h3>Participation Trends</h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={trendData} margin={{ top: 50, right: 30, left: 50, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
                tickFormatter={(value) =>
                  value.length > 20 ? value.slice(0, 20) + "..." : value
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="participants" fill="#640606ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


    </div>
  );
};

export default Analytics;
