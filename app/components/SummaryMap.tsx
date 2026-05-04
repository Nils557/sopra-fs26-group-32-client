"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function SummaryMap({ lat, lng }: { lat: number; lng: number }) {
return (
    <MapContainer center={[lat, lng]} zoom={8} style={{ height: "100%", width: "100%" }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[lat, lng]} />
    </MapContainer>
);
}