// app/vendors/register/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Locate } from "lucide-react";
import { api } from "@/lib/api";

// Fix Leaflet icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const vendorSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  owner_name: z.string().min(2, "Your name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  category: z.string().min(1, "Select a category"),
  description: z.string().min(20, "Description too short"),
  lat: z.number(),
  lng: z.number(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const categories = [
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

function LocationMarker({ position }: { position: LatLngExpression | null }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      window.__SET_VENDOR_POS?.([lat, lng]);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Your store location</Popup>
    </Marker>
  ) : null;
}

export default function VendorRegistrationPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { lat: 0, lng: 0 },
  });

  // Expose setter globally for map click
  useState(() => {
    (window as any).__SET_VENDOR_POS = setPosition;
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not supported", description: "Geolocation is not supported", variant: "destructive" });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setValue("lat", lat);
        setValue("lng", lng);
        toast({ title: "Location Found!", description: "Your current location is set" });
        setIsLocating(false);
      },
      () => {
        toast({ title: "Permission Denied", description: "Please allow location access", variant: "destructive" });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const goToNextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["business_name", "owner_name", "email", "phone", "category", "description"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      if (!position) {
        toast({ title: "Location Required", description: "Please set your store location", variant: "destructive" });
        return;
      }
      const valid = await trigger(["address"]);
      if (valid) setStep(3);
    }
  };

  const onSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    try {
      await api.post("/api/vendors/register", data);
      toast({ title: "Success!", description: "Application submitted! We'll review it soon." });
      setStep(4);
    } catch {
      toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a <span className="text-primary">Starbiit Vendor</span>
          </h1>
          <p className="text-xl text-muted-foreground">Accept our token in your store</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register Your Business</CardTitle>
            <CardDescription>Step {step} of 3</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name *</Label>
                    <Input {...register("business_name")} placeholder="Star Coffee" />
                    {errors.business_name && <p className="text-sm text-destructive mt-1">{errors.business_name.message}</p>}
                  </div>
                  <div>
                    <Label>Owner Name *</Label>
                    <Input {...register("owner_name")} placeholder="John Doe" />
                    {errors.owner_name && <p className="text-sm text-destructive mt-1">{errors.owner_name.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input {...register("email")} type="email" />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input {...register("phone")} placeholder="+1 555 000 1234" />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select onValueChange={(v) => setValue("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea {...register("description")} rows={4} placeholder="Tell us about your business..." />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                </div>

                <Button type="button" size="lg" className="w-full" onClick={goToNextStep}>
                  Next: Set Location
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Physical Address *</Label>
                  <Input {...register("address")} placeholder="123 Main St, Miami, FL" />
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
                </div>

                <div>
                  <Label>Set Your Store Location *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4"
                    onClick={getCurrentLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Detecting Location...
                      </>
                    ) : (
                      <>
                        <Locate className="mr-2 h-4 w-4" />
                        Use My Current Location
                      </>
                    )}
                  </Button>

                  <div className="h-96 rounded-lg overflow-hidden border">
                    <MapContainer center={position || [25.7617, -80.1918]} zoom={position ? 16 : 2} style={{ height: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker position={position} />
                    </MapContainer>
                  </div>
                  {position && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={goToNextStep} className="flex-1" size="lg">Review & Submit</Button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="text-center py-12 space-y-8">
                <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Submit!</h3>
                  <p className="text-muted-foreground">Your store will appear on our map after approval</p>
                </div>
                <Button size="lg" className="w-full" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            )}

            {/* Success */}
            {step === 4 && (
              <div className="text-center py-20 space-y-6">
                <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
                <h2 className="text-3xl font-bold">Thank You!</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Your application has been submitted. We'll notify you once approved.
                </p>
                <Button asChild size="lg">
                  <a href="/">Back to Home</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}