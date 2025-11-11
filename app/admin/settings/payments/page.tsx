"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2, AlertCircle, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface PaymentMethod {
  id?: number;
  coin_name: string;
  wallet_address: string;
  network: string;
  min_amount: number;
  max_amount: number | null;
}

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [formData, setFormData] = useState<PaymentMethod>({
    coin_name: "",
    wallet_address: "",
    network: "",
    min_amount: 0,
    max_amount: null,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined networks (can be fetched from backend if needed)
  const networks = [
    "Bitcoin",
    "Ethereum Mainnet",
    "Binance Smart Chain",
    "Polygon",
    "Solana",
  ];

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in as an admin to view settings");
          return;
        }

   

        const response = await fetch(`${API_BASE_URL}/api/admin/settings/payments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.data);
        } else {
          throw new Error(data.error || "Failed to load payment methods");
        }
      } catch (err: any) {
        setError(err.message || "Network error. Please check your connection and try again.");
        console.error("Error fetching payment methods:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        throw new Error("Please log in as an admin to update settings");
      }

      const url = editingId
        ? `${API_BASE_URL}/api/admin/settings/payments/${editingId}`
        : `${API_BASE_URL}/api/admin/settings/payments`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? "update" : "add"} payment method`);
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: `Payment Method ${editingId ? "Updated" : "Added"}`,
          description: `Payment method has been ${editingId ? "updated" : "added"} successfully.`,
        });

        if (editingId) {
          setPaymentMethods(
            paymentMethods.map((method) =>
              method.id === editingId ? data.data : method
            )
          );
        } else {
          setPaymentMethods([...paymentMethods, data.data]);
        }

        // Reset form
        setFormData({
          coin_name: "",
          wallet_address: "",
          network: "",
          min_amount: 0,
          max_amount: null,
        });
        setEditingId(null);
      } else {
        throw new Error(data.error || `Failed to ${editingId ? "update" : "add"} payment method`);
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection and try again.");
      console.error(`Error ${editingId ? "updating" : "adding"} payment method:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setFormData(method);
    setEditingId(method.id!);
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        throw new Error("Please log in as an admin to delete settings");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/settings/payments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Payment Method Deleted",
          description: "Payment method has been deleted successfully.",
        });
        setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
      } else {
        throw new Error(data.error || "Failed to delete payment method");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection and try again.");
      console.error("Error deleting payment method:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Crypto Payment Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage cryptocurrency payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Form for Adding/Editing Payment Method */}
            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="coin_name" className="text-foreground">
                  Coin Name
                </Label>
                <Input
                  id="coin_name"
                  value={formData.coin_name}
                  onChange={(e) =>
                    setFormData({ ...formData, coin_name: e.target.value })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="e.g., Bitcoin, Ethereum"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet_address" className="text-foreground">
                  Wallet Address
                </Label>
                <Input
                  id="wallet_address"
                  value={formData.wallet_address}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet_address: e.target.value })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network" className="text-foreground">
                  Network
                </Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_amount" className="text-foreground">
                  Minimum Amount
                </Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_amount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="e.g., 0.0001 (in native coin unit)"
                  min="0"
                  step="0.00000001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount" className="text-foreground">
                  Maximum Amount (Optional)
                </Label>
                <Input
                  id="max_amount"
                  type="number"
                  value={formData.max_amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_amount: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="e.g., 100 (in native coin unit, leave blank for no limit)"
                  min="0"
                  step="0.00000001"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingId ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingId ? "Update Payment Method" : "Add Payment Method"
                )}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  className="ml-2 bg-transparent"
                  onClick={() => {
                    setFormData({
                      coin_name: "",
                      wallet_address: "",
                      network: "",
                      min_amount: 0,
                      max_amount: null,
                    });
                    setEditingId(null);
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </form>

            {/* List of Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Existing Payment Methods
              </h3>
              {paymentMethods.length === 0 ? (
                <p className="text-muted-foreground">No payment methods configured yet.</p>
              ) : (
                paymentMethods.map((method) => (
                  <Card key={method.id} className="bg-muted/50 border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {method.coin_name} ({method.network})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Address: {method.wallet_address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Min: {method.min_amount} | Max: {method.max_amount || "No limit"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(method.id!)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}