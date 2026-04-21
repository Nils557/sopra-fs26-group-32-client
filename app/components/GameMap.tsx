"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  export default function GameMap() {
    const [expanded, setExpanded] = useState(false);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function ClickHandler() {
      useMapEvents({ click: (e) => setPin({ lat: e.latlng.lat, lng: e.latlng.lng }) });
      return null;
    }

    function MapController({ expanded, pin }: { expanded: boolean; pin: { lat: number; lng: number } | null }) {
      const map = useMap();
      useEffect(() => {
        if (!expanded) {
          const center = pin ? [pin.lat, pin.lng] as [number, number] : [20, 0] as [number, number];
          setTimeout(() => map.setView(center, map.getZoom()), 300);
        }
      }, [expanded, map, pin]);
      return null;
    }

    return (
      <div
        onMouseEnter={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
          setExpanded(true);
        }}
        onMouseLeave={() => {
          closeTimer.current = setTimeout(() => setExpanded(false), 300);
        }}
        style={{
          position: "absolute",
          bottom: 10,
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
          <MapController expanded={expanded} pin={pin} />
          <ClickHandler />
          {pin && <Marker position={[pin.lat, pin.lng]} />}
        </MapContainer>
      </div>
    );
  }