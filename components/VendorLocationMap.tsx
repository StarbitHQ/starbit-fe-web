// components/VendorLocationMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons
if (typeof window !== "undefined") {
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

type VendorLocationMapProps = {
  position: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
};

function LocationMarker({ position, onMapClick }: VendorLocationMapProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Your store location</Popup>
    </Marker>
  ) : null;
}

export default function VendorLocationMap({ position, onMapClick }: VendorLocationMapProps) {
  const center: [number, number] = position || [25.7617, -80.1918];
  const zoom = position ? 16 : 2;

  return (
    <div className="h-96 rounded-lg overflow-hidden border">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%" }}
        key={position ? `${position[0]}-${position[1]}` : 'default'}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker position={position} onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
}