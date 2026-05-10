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

  export default function GameMap({ roundNumber, onPinPlaced, disabled = false }: { roundNumber: number; onPinPlaced?:
  (pin: { lat: number; lng: number }) => void; disabled?: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isMobileLayout, setIsMobileLayout] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDragging = useRef(false);

    useEffect(() => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
      const check = () => setIsMobileLayout(window.innerWidth <= 900);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);

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
      },
    });
      return null;
    }

      function MapController({ expanded, pin, isDragging, submitted }: { expanded: boolean; pin: { lat: number; lng: number } | null;
      isDragging: React.MutableRefObject<boolean>; submitted:boolean; }) {
      const map = useMap();
      useEffect(() => {
        map.on("dragstart", () => { isDragging.current = true; });
        map.on("dragend", () => { setTimeout(() => { isDragging.current = false; }, 400); });
        return () => { map.off("dragstart"); map.off("dragend"); };
      }, [map, isDragging]);
      useEffect(() => {
        if (submitted) {
          map.dragging.disable();
          map.scrollWheelZoom.disable();
          map.doubleClickZoom.disable();
          map.touchZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
        } else {
          map.dragging.enable();
          map.scrollWheelZoom.enable();
          map.doubleClickZoom.enable();
          map.touchZoom.enable();
          map.boxZoom.enable();
          map.keyboard.enable();
        }
      }, [submitted, map]);
      
      useEffect(() => {
        if (!expanded  && pin) {
          const id = setTimeout(() => map.setView([pin.lat, pin.lng], map.getZoom()), 300);
          return () => clearTimeout(id);
        }
      }, [expanded, map, pin]);
      return null;
    }
      

    return (
      <div
        onClick={() => { if (isTouchDevice) setExpanded(prev => !prev); }}
        onMouseEnter={() => {
          if (isMobileLayout) return; 
          if (closeTimer.current) clearTimeout(closeTimer.current);
          setExpanded(true);
        }}
        onMouseLeave={() => {
          if (isMobileLayout) return;
          closeTimer.current = setTimeout(() => {
            if (!isDragging.current) setExpanded(false);
          }, 300);
        }}
        style={{
          position: isMobileLayout ? "relative" : "absolute",
          bottom: isMobileLayout ? "auto" : 10,
          left: isMobileLayout ? "auto" : 0,
          width: isMobileLayout ? "100%" : (expanded ? "min(400px, 85vw)" : "min(200px, 45vw)"),
          transition: "width 0.3s ease, height 0.3s ease",
          borderRadius: "8px",
          border: "2px solid #1e2940",
          zIndex: 10,
        }}
      >
        <div style={{
          height: isMobileLayout ? "200px" : (expanded ? "min(300px, 64vw)" : "min(150px, 32vw)"),
          transition: "height 0.3s ease",
          overflow: "hidden",
          borderRadius: "6px",
        }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController expanded={expanded} pin={pin} isDragging={isDragging} submitted={submitted} />
          <ClickHandler submitted={submitted} setPin={setPin} disabled={disabled} />
          {pin && <Marker position={[pin.lat, pin.lng]} />}
        </MapContainer>
        </div>
        <div style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, padding: "3px 0",
          color: submitted ? "#4ade80" : pin ? "#f4941b" : "#6b7280" }}>
          {submitted
            ? "Guess submitted!"
            : pin
            ? "Pin placed — move it or submit below"
            : "Click on the map to place your pin"}
        </div>
        {pin && !submitted && !disabled && (
          <button
            onClick={() => { setSubmitted(true); onPinPlaced?.(pin); }}
            style={{
              width: "100%",
              padding: "6px 0",
              background: "#f4941b",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              borderRadius: "0 0 6px 6px",
              cursor: "pointer",
            }}
          >
            Submit Guess
          </button>
        )}
      </div>
    );
  }