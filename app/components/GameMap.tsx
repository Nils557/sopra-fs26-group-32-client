"use client";

  import { useState } from "react";
  import { MapContainer, TileLayer } from "react-leaflet";

  export default function GameMap() {
    const [expanded, setExpanded] = useState(false);

    return (
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: expanded ? "400px" : "200px",
          height: expanded ? "300px" : "150px",
          transition: "width 0.3s ease, height 0.3s ease",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #1e2940",
          zIndex: 10,
        }}
      >
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        </MapContainer>
      </div>
    );
  }