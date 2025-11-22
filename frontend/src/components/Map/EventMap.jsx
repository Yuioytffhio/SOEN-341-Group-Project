import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, DivIcon, point } from "leaflet";
import "leaflet/dist/leaflet.css";

const pin_icon = new Icon({
  iconUrl: require("../../assets/map_pin.png"),
  iconSize: [38, 38],
});

const cluster_icon = (cluster) =>
  new DivIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });

export default function EventMap({ events }) {
  return (
    <MapContainer
      center={[45.4949, -73.5787]}
      zoom={15}
      className="map-container"
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup chunkedLoading iconCreateFunction={cluster_icon}>
        {events.map((event) =>
          !isNaN(event.locationLat) && !isNaN(event.locationLng) ? (
            <Marker
              key={event.id}
              icon={pin_icon}
              position={[Number(event.locationLat), Number(event.locationLng)]}
            >
              <Popup>
                <strong>{event.eventTitle}</strong>
                <br />
                {event.eventDate && new Date(event.eventDate.seconds * 1000).toLocaleString()}
                <br />
                <strong>Capacity:</strong> {event.eventCapacity}
              </Popup>
            </Marker>
          ) : null
        )}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
