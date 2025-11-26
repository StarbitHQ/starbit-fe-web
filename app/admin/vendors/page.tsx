"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Store, Clock, MapPin } from "lucide-react";

type Vendor = {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminVendorsPanel() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await api.get<Vendor[]>("/api/admin/vendors");
      setVendors(data);
    } catch {
      toast({ title: "Error", description: "Failed to load vendors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (id: number) => {
    try {
      await api.post(`/api/admin/vendors/${id}/approve`);
      toast({ title: "Approved!", description: "Vendor is now live on the map" });
      loadVendors();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const rejectVendor = async () => {
    if (!selectedVendor || !rejectReason.trim()) return;

    try {
      await api.post(`/api/admin/vendors/${selectedVendor.id}/reject`, { reason: rejectReason });
      toast({ title: "Rejected", description: "Vendor has been notified" });
      setRejectModalOpen(false);
      setRejectReason("");
      loadVendors();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading vendors...</div>;
  }

  const pending = vendors.filter(v => v.status === "pending");

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Vendor Applications</h1>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl">No pending applications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pending.map((vendor) => (
            <Card key={vendor.id} className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-6 w-6" />
                  {vendor.business_name}
                </CardTitle>
                <CardDescription>{vendor.owner_name}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> {vendor.email}</p>
                  <p><strong>Phone:</strong> {vendor.phone}</p>
                  <p><strong>Category:</strong> {vendor.category}</p>
                  <p className="flex items-start gap-1">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{vendor.address}</span>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => approveVendor(vendor.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setRejectModalOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to reject <strong>{selectedVendor?.business_name}</strong>?</p>
            <Textarea
              placeholder="Reason for rejection (will be sent to vendor)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={rejectVendor} disabled={!rejectReason.trim()}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}