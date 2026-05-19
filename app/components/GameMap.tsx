"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  export default function GameMap({ roundNumber, onPinPlaced, disabled = false }: { roundNumber: number;
   onPinPlaced?: (pin: { lat: number; lng: number }) => void; disabled?: boolean }) {
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const isDragging = useRef(false);

    useEffect(() => {
      setPin(null);
      setSubmitted(false);
    }, [roundNumber]);

    useEffect(() => {
      if (disabled && pin && !submitted) {
        setSubmitted(true);
        onPinPlaced?.(pin);
      }
    }, [disabled, pin, submitted, onPinPlaced]);

    function ClickHandler({ setPin, disabled, submitted }: {
      setPin: (p: { lat: number; lng: number }) => void;
      disabled: boolean;
      submitted: boolean;
    }) {
      useMapEvents({ click: (e) => {
        if (!submitted && !disabled) setPin({ lat: e.latlng.lat, lng: e.latlng.lng });
      }});
      return null;
    }

    function MapController({ pin, isDragging, submitted }: { pin: { lat: number; lng: number } | null;
  isDragging: React.MutableRefObject<boolean>; submitted: boolean }) {
      const map = useMap();
      useEffect(() => {
        map.on("dragstart", () => { isDragging.current = true; });
        map.on("dragend", () => { setTimeout(() => { isDragging.current = false; }, 400); });
        return () => { map.off("dragstart"); map.off("dragend"); };
      }, [map, isDragging]);
      useEffect(() => {
        if (submitted) {
          map.dragging.disable(); map.scrollWheelZoom.disable();
          map.doubleClickZoom.disable(); map.touchZoom.disable();
          map.boxZoom.disable(); map.keyboard.disable();
        } else {
          map.dragging.enable(); map.scrollWheelZoom.enable();
          map.doubleClickZoom.enable(); map.touchZoom.enable();
          map.boxZoom.enable(); map.keyboard.enable();
        }
      }, [submitted, map]);
      useEffect(() => {
        if (pin) {
          const id = setTimeout(() => map.setView([pin.lat, pin.lng], map.getZoom()), 300);
          return () => clearTimeout(id);
        }
      }, [map, pin]);
      return null;
    }

    return (
      <div style={{ width: "100%", borderRadius: "8px", border: "2px solid #1e2940", zIndex: 10 }}>
        <div style={{ height: "200px", overflow: "hidden", borderRadius: "6px" }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }} attributionControl={true}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a
            href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController pin={pin} isDragging={isDragging} submitted={submitted} />
            <ClickHandler submitted={submitted} setPin={setPin} disabled={disabled} />
            {pin && <Marker position={[pin.lat, pin.lng]} />}
          </MapContainer>
        </div>
        <div style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, padding: "3px 0",
          color: submitted ? "#4ade80" : pin ? "#f4941b" : "#6b7280" }}>
          {submitted ? "Guess submitted!" : pin ? "Pin placed — move it or submit below" : "Click on the map to place your pin"}
        </div>
        {pin && !submitted && !disabled && (
          <button
            onClick={() => { setSubmitted(true); onPinPlaced?.(pin); }}
            style={{ width: "100%", padding: "6px 0", background: "#f4941b", color: "#fff",
              fontWeight: 700, fontSize: "13px", border: "none", borderRadius: "0 0 6px 6px", cursor:
  "pointer" }}
          >
            Submit Guess
          </button>
        )}
      </div>
    );
  }