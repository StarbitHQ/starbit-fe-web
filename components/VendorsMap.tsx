// components/VendorsMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";

// Fix Leaflet default icon
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Vendor = {
  id: number;
  business_name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
};

type VendorsMapProps = {
  vendors: Vendor[];
  center: [number, number];
  zoom: number;
};

export default function VendorsMap({ vendors, center, zoom }: VendorsMapProps) {
  return (
    <div className="h-full min-h-96 rounded-lg overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }}
        key={`${center[0]}-${center[1]}`} // Force re-render when center changes
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        {vendors.map((vendor) => (
          <Marker key={vendor.id} position={[vendor.lat, vendor.lng]} icon={customIcon}>
            <Popup>
              <div className="text-center min-w-48">
                <Store className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-bold text-lg">{vendor.business_name}</h3>
                <p className="text-sm text-muted-foreground">{vendor.address}</p>
                <Badge className="mt-3">{vendor.category}</Badge>
                <div className="mt-3">
                  <Button size="sm" className="w-full">
                    Get Directions
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}