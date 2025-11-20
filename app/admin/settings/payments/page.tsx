// app/admin/settings/payments/page.tsx
"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2, AlertCircle, Trash2, Edit, CheckCircle2, XCircle, Wallet } from "lucide-react";
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

interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  network: string;
  type: "native" | "token";
  contract_address: string | null;
  decimals: number;
  required_confirmations: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  
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

  // Fetch both payment methods and supported cryptocurrencies
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Authentication required. Please log in as admin.");
          return;
        }

        const [paymentsRes, cryptosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/settings/payments`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/settings/cryptocurrencies`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        if (!paymentsRes.ok || !cryptosRes.ok) {
          throw new Error("Failed to load settings");
        }

        const paymentsData = await paymentsRes.json();
        const cryptosData = await cryptosRes.json();

        if (paymentsData.success) setPaymentMethods(paymentsData.data);
        if (cryptosData.success) setCryptocurrencies(cryptosData.data);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) throw new Error("Authentication required");

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

      if (!response.ok) throw new Error("Operation failed");

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      toast({
        title: editingId ? "Updated" : "Added",
        description: `Payment method ${editingId ? "updated" : "added"} successfully.`,
      });

      if (editingId) {
        setPaymentMethods(prev => prev.map(m => m.id === editingId ? data.data : m));
      } else {
        setPaymentMethods(prev => [...prev, data.data]);
      }

      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setFormData(method);
    setEditingId(method.id!);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this payment method?")) return;

    setIsSubmitting(true);
    try {
      const authToken = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/settings/payments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setPaymentMethods(prev => prev.filter(m => m.id !== id));
      toast({ title: "Deleted", description: "Payment method removed." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCryptoStatus = async (id: number) => {
    setIsSubmitting(true);
    try {
      const authToken = Cookies.get("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/settings/cryptocurrencies/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error("Failed to update status");

      const data = await res.json();
      if (data.success) {
        setCryptocurrencies(prev =>
          prev.map(c => c.id === id ? { ...c, is_active: data.data.is_active } : c)
        );
        toast({
          title: "Status Updated",
          description: data.data.is_active ? "Cryptocurrency activated" : "Cryptocurrency deactivated",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coin_name: "",
      wallet_address: "",
      network: "",
      min_amount: 0,
      max_amount: null,
    });
    setEditingId(null);
  };

  const hasWallet = (name: string, network: string) =>
    paymentMethods.some(pm => pm.coin_name === name && pm.network === network);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p>Loading payment settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <DollarSign className="h-7 w-7 text-primary" />
              Crypto Payment Settings
            </CardTitle>
            <CardDescription>
              Manage supported cryptocurrencies and deposit wallet addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">

            {/* Add/Edit Payment Method Form */}
            <div className="border-b pb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {editingId ? "Edit" : "Add"} Deposit Wallet
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <div>
                  <Label>Coin Name</Label>
                  <Input
                    value={formData.coin_name}
                    onChange={e => setFormData({ ...formData, coin_name: e.target.value })}
                    placeholder="e.g. Bitcoin"
                    required
                  />
                </div>
                <div>
                  <Label>Network</Label>
                  <Input
                    value={formData.network}
                    onChange={e => setFormData({ ...formData, network: e.target.value })}
                    placeholder="e.g. Bitcoin, Ethereum Mainnet"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Wallet Address</Label>
                  <Input
                    value={formData.wallet_address}
                    onChange={e => setFormData({ ...formData, wallet_address: e.target.value })}
                    placeholder="Enter receiving wallet address"
                    required
                  />
                </div>
                <div>
                  <Label>Minimum Deposit</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.min_amount}
                    onChange={e => setFormData({ ...formData, min_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0001"
                    required
                  />
                </div>
                <div>
                  <Label>Maximum Deposit (optional)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.max_amount || ""}
                    onChange={e => setFormData({ ...formData, max_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="No limit"
                  />
                </div>
                <div className="flex gap-3 md:col-span-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingId ? "Update" : "Add"} Wallet
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Supported Cryptocurrencies */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Supported Cryptocurrencies</h3>
              <div className="grid gap-4">
                {cryptocurrencies.length === 0 ? (
                  <p className="text-muted-foreground">No cryptocurrencies configured.</p>
                ) : (
                  cryptocurrencies.map(crypto => {
                    const walletSet = hasWallet(crypto.name, crypto.network);
                    return (
                      <Card key={crypto.id} className={!crypto.is_active ? "opacity-60" : ""}>
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-lg">
                                {crypto.name} <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{crypto.symbol}</span>
                              </p>
                              <span className="text-sm text-muted-foreground">• {crypto.network}</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                Type: <strong>{crypto.type}</strong> | 
                                Decimals: <strong>{crypto.decimals}</strong> | 
                                Confirmations: <strong>{crypto.required_confirmations}</strong>
                              </p>
                              {crypto.contract_address && (
                                <p className="font-mono text-xs truncate max-w-lg">
                                  Contract: {crypto.contract_address}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-4 text-sm pt-2">
                              <span className="flex items-center gap-1">
                                {crypto.is_active ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                {crypto.is_active ? "Active" : "Inactive"}
                              </span>
                              <span className="flex items-center gap-1">
                                {walletSet ? (
                                  <><CheckCircle2 className="h-4 w-4 text-green-600" /> Wallet Configured</>
                                ) : (
                                  <><XCircle className="h-4 w-4 text-orange-600" /> No Wallet Set</>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={crypto.is_active ? "outline" : "default"}
                              onClick={() => toggleCryptoStatus(crypto.id)}
                              disabled={isSubmitting}
                            >
                              {crypto.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Current Payment Methods */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold mb-4">Current Deposit Wallets</h3>
              {paymentMethods.length === 0 ? (
                <p className="text-muted-foreground">No wallet addresses configured yet.</p>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <Card key={method.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {method.coin_name} ({method.network})
                          </p>
                          <p className="text-sm font-mono text-muted-foreground break-all">
                            {method.wallet_address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Min: {method.min_amount} | Max: {method.max_amount || "No limit"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(method)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => method.id && handleDelete(method.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}