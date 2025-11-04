import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; // adjust path if needed
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
        const eventsRef = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsRef);

        let totalEvents = eventsSnapshot.size;
        let totalTickets = 0;
        let trendList = [];

        eventsSnapshot.forEach((doc) => {
          const data = doc.data();
          totalTickets += data.ticketsIssued || 0;
          trendList.push({
            name: data.name || "Unnamed Event",
            participants: data.participants || 0,
          });
        });

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

  if (loading) return <p className="analytics-loading">Loading analytics...</p>;

  return (
    <div className="analytics-page">
      <h2 className="analytics-title">Global Statistics</h2>

      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>Total Events</h3>
          <p>{eventCount}</p>
        </div>
        <div className="analytics-card">
          <h3>Tickets Issued</h3>
          <p>{ticketCount}</p>
        </div>
      </div>

      <div className="analytics-chart">
        <h3>Participation Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="participants" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
