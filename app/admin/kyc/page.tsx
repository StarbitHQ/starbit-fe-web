"use client";

import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

interface KYCUser {
  id: number;
  name: string;
  email: string;
  kyc_status: "pending" | "approved" | "rejected" | "not-started";
  kyc_id_path: string | null;
  kyc_selfie_path: string | null;
  kyc_rejection_reason: string | null;
  submitted_at: string;
}

export default function KYCAdminPage() {
  const [users, setUsers] = useState<KYCUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch users with KYC submissions
  useEffect(() => {
    const fetchKYCUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          setError("Please log in to view KYC submissions");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/kyc/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch KYC submissions");
        }

        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message || "Failed to load KYC submissions");
        }
      } catch (err) {
        setError("Network error. Please check your connection and try again.");
        console.error("Error fetching KYC users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKYCUsers();
  }, []);

  // Handle KYC approval
  const handleApprove = async (userId: number) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const authToken = Cookies.get("auth_token");
      const response = await fetch(`/api/kyc/approve/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map((user) => 
          user.id === userId ? { ...user, kyc_status: "approved", kyc_rejection_reason: null } : user
        ));
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, kyc_status: "approved", kyc_rejection_reason: null });
        }
      } else {
        setActionError(data.message || "Failed to approve KYC");
      }
    } catch (err) {
      setActionError("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle KYC rejection
  const handleReject = async (userId: number) => {
    if (!rejectionReason) {
      setActionError("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      const authToken = Cookies.get("auth_token");
      const response = await fetch(`/api/kyc/reject/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map((user) => 
          user.id === userId ? { ...user, kyc_status: "rejected", kyc_rejection_reason: rejectionReason } : user
        ));
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, kyc_status: "rejected", kyc_rejection_reason: rejectionReason });
        }
        setRejectionReason("");
      } else {
        setActionError(data.message || "Failed to reject KYC");
      }
    } catch (err) {
      setActionError("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading KYC submissions...</p>
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
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              KYC Submissions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Review and manage user KYC submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedUser.name}'s KYC Submission
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to List
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* ID Document */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Identification Document
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedUser.kyc_id_path ? (
                        <Image
                          src={selectedUser.kyc_id_path}
                          alt="KYC ID Document"
                          width={400}
                          height={300}
                          className="rounded-lg border border-border"
                        />
                      ) : (
                        <p className="text-muted-foreground">No ID document uploaded</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Selfie */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Selfie with ID
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedUser.kyc_selfie_path ? (
                        <Image
                          src={selectedUser.kyc_selfie_path}
                          alt="KYC Selfie"
                          width={400}
                          height={300}
                          className="rounded-lg border border-border"
                        />
                      ) : (
                        <p className="text-muted-foreground">No selfie uploaded</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant={selectedUser.kyc_status === "approved" ? "default" : selectedUser.kyc_status === "rejected" ? "destructive" : "secondary"}
                        className={
                          selectedUser.kyc_status === "approved"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : selectedUser.kyc_status === "rejected"
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                        }
                      >
                        {selectedUser.kyc_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-semibold">{new Date(selectedUser.submitted_at).toLocaleString()}</p>
                    </div>
                    {selectedUser.kyc_rejection_reason && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Rejection Reason</p>
                        <p className="font-semibold text-destructive">{selectedUser.kyc_rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  {selectedUser.kyc_status === "pending" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
                        <Input
                          id="rejectionReason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection"
                          className="w-full"
                        />
                      </div>
                      {actionError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {actionError}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(selectedUser.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedUser.id)}
                          disabled={actionLoading}
                          variant="destructive"
                          className="flex-1"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No KYC submissions found</p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant={user.kyc_status === "approved" ? "default" : user.kyc_status === "rejected" ? "destructive" : "secondary"}
                          className={
                            user.kyc_status === "approved"
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : user.kyc_status === "rejected"
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          }
                        >
                          {user.kyc_status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}