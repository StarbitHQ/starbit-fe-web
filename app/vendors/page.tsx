// app/vendors/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, MapPin, Navigation } from "lucide-react";
import { api } from "@/lib/api";

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

const categories = [
  "All Categories",
  "Restaurant & Cafe",
  "Grocery & Supermarket",
  "Electronics",
  "Fashion & Clothing",
  "Pharmacy",
  "Beauty & Salon",
  "Gas Station",
  "Hotel & Lodging",
  "Entertainment",
  "Other",
];

export default function VendorsMapPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([20, 0]); // World view initially
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Load vendors
  useEffect(() => {
    api
      .get<Vendor[]>("/api/vendors")
      .then((data) => {
        setVendors(data);
        setFilteredVendors(data);
        if (data.length > 0) {
          setMapCenter([data[0].lat, data[0].lng]);
        }
      })
      .catch(() => {});
  }, []);

  // Filter by category
  useEffect(() => {
    if (selectedCategory === "All Categories") {
      setFilteredVendors(vendors);
    } else {
      setFilteredVendors(vendors.filter((v) => v.category === selectedCategory));
    }
  }, [selectedCategory, vendors]);

  // Focus map on user's location
  const goToMyLocation = () => {
    if (!navigator.geolocation) return;

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setIsLoadingLocation(false);
      },
      () => setIsLoadingLocation(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Stores That Accept <span className="text-primary">Starbiit</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover physical businesses near you that accept our token for real-world payments.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={goToMyLocation} className="w-full" disabled={isLoadingLocation}>
                  {isLoadingLocation ? (
                    <>
                      <Navigation className="mr-2 h-4 w-4 animate-spin" />
                      Finding You...
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Show My Location
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>{filteredVendors.length}</strong> store{filteredVendors.length !== 1 && "s"} found
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vendor List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => setMapCenter([vendor.lat, vendor.lng])}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{vendor.business_name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.address}</p>
                        <Badge className="mt-2 text-xs">{vendor.category}</Badge>
                      </div>
                      <Store className="h-8 w-8 text-primary opacity-70" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-full min-h-96">
              <CardContent className="p-0 h-full">
                <div className="h-full min-h-96 rounded-lg overflow-hidden">
                  <MapContainer center={mapCenter} zoom={filteredVendors.length === 1 ? 15 : 3} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                    />
                    {filteredVendors.map((vendor) => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}