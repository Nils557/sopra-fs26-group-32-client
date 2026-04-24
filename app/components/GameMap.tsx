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

  export default function GameMap({ roundNumber, onPinPlaced, disabled = false }: { roundNumber: number; onPinPlaced?: (pin: { lat: number; lng: number }) => Promise<void> | void; disabled?: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
    const [submitError, setSubmitError] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setPin(null);
      setSubmitError(false);
    }, [roundNumber]);

    function ClickHandler({ pin, setPin, disabled }: {
      pin: { lat: number; lng: number } | null;
      setPin: (p: { lat: number; lng: number } | null) => void;
      disabled: boolean;
    }) {
      useMapEvents({
        click: async (e) => {
          if (pin || disabled) return;
          const newPin = { lat: e.latlng.lat, lng: e.latlng.lng };
          setPin(newPin);
          setSubmitError(false);
          try {
            await onPinPlaced?.(newPin);
          } catch {
            // POST failed — clear the pin so the player can retry, surface the error.
            setPin(null);
            setSubmitError(true);
          }
        },
      });
      return null;
    }

    function MapController({ expanded, pin }: { expanded: boolean; pin: { lat: number; lng: number } | null }) {
      const map = useMap();
      useEffect(() => {
        if (pin) {
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
      }, [pin, map]);
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
          
          transition: "width 0.3s ease, height 0.3s ease",
          borderRadius: "8px",
          
          border: "2px solid #1e2940",
          zIndex: 10,
        }}
      >
        <div style={{
          height: expanded ? "300px" : "150px",
          transition: "height 0.3s ease",
          overflow: "hidden",
          borderRadius: "6px",
        }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController expanded={expanded} pin={pin} />
          <ClickHandler pin={pin} setPin={setPin} disabled={disabled} />
          {pin && <Marker position={[pin.lat, pin.lng]} />}
        </MapContainer>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 0",
            color: submitError ? "#ff4d4f" : pin ? "#4ade80" : "#f4941b",
          }}>
          {submitError
            ? "Guess failed — tap the map to try again"
            : pin
              ? "Your guess has been submitted"
              : "Click on the map to make your guess"}
        </div>
      </div>
    );
  }