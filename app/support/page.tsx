"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, Upload, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

// Utility function to get cookie by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

interface Reply {
  id: number;
  support_id: number;
  message: string;
  user_id: number;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  replies_count: number;
  image_url?: string;
  replies?: Reply[];
}

export default function SupportPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    file: null as File | null,
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [ticketCreated, setTicketCreated] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tickets on component mount or when a new ticket is created
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const token = getCookie("auth_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/support`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();
        const validTickets = Array.isArray(data.tickets)
          ? data.tickets.filter(
              (ticket: any) => ticket && typeof ticket === "object" && "id" in ticket && "status" in ticket
            )
          : [];
        setTickets(validTickets);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load tickets",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [ticketCreated, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB to match backend)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 2MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG, JPG, GIF, and SVG images are allowed",
          variant: "destructive",
        });
        return;
      }

      setFormData({ ...formData, file });

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, file: null });
    setFilePreview(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = getCookie("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("description", formData.description);
      if (formData.file) {
        formDataToSend.append("image_url", formData.file);
      }

      const response = await fetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create ticket");
      }

      const newTicket = await response.json();
      const ticket = newTicket.ticket || newTicket;
      if (ticket && typeof ticket === "object" && "id" in ticket && "status" in ticket) {
        setTickets([ticket, ...tickets]);
        setTicketCreated((prev) => prev + 1);
        toast({
          title: "Ticket created!",
          description: "Our support team will respond within 24 hours",
          className: "bg-primary text-primary-foreground",
        });
        setFormData({ subject: "", description: "", file: null });
        setFilePreview(null);
        const fileInput = document.getElementById("file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setIsCreating(false);
      } else {
        throw new Error("Received invalid ticket data from the server");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (ticketId: number) => {
    try {
      const token = getCookie("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/support/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch ticket details");
      }

      const data = await response.json();
      if (data.ticket && typeof data.ticket === "object" && "status" in data.ticket) {
        setSelectedTicket(data.ticket);
      } else {
        throw new Error("Invalid ticket data");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load ticket details",
        variant: "destructive",
      });
    }
  };

  const handleCloseDetails = () => {
    setSelectedTicket(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 gap-1">
            <Clock className="h-3 w-3" />
            Open
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" />
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Support Center</h1>
            <p className="text-muted-foreground">Get help from our support team</p>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {/* Create Ticket Form */}
        {isCreating && (
          <Card className="mb-6 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Create Support Ticket</CardTitle>
              <CardDescription className="text-muted-foreground">
                Describe your issue and we'll help you resolve it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-background border-input text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background border-input text-foreground resize-none"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-foreground">
                    Attachment (Optional)
                  </Label>
                  {!formData.file ? (
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 text-center hover:border-primary/40 transition-colors">
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      />
                      <label htmlFor="file" className="cursor-pointer">
                        <Upload className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-foreground">
                          Click to upload screenshot or image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, JPG, GIF, SVG up to 2MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4">
                      {filePreview ? (
                        <div className="space-y-3">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-48 object-contain rounded-lg bg-muted"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-foreground truncate flex-1">
                              {formData.file.name}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-primary/10">
                              <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-foreground font-medium truncate max-w-xs">
                                {formData.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(formData.file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
              <CardHeader className="relative">
                <CardTitle className="text-foreground">{selectedTicket.subject}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Created on {new Date(selectedTicket.created_at).toLocaleDateString()}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={handleCloseDetails}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTicket.description}</p>
                </div>
                {selectedTicket.image_url && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Attachment</h4>
                    <div className="space-y-2">
                      <img
                        src={
                          selectedTicket.image_url.startsWith("http")
                            ? selectedTicket.image_url
                            : `${API_BASE_URL}${selectedTicket.image_url}`
                        }
                        alt="Ticket attachment"
                        className="w-full max-w-md rounded-lg border border-border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <a
                        href={
                          selectedTicket.image_url.startsWith("http")
                            ? selectedTicket.image_url
                            : `${API_BASE_URL}${selectedTicket.image_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm hidden"
                      >
                        View Attachment (if image doesn't load)
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Status</h4>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Replies</h4>
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTicket.replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-primary/20 pl-4 py-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-foreground">{reply.user.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No replies yet</p>
                  )}
                </div>
                <Button variant="outline" className="w-full bg-transparent" onClick={handleCloseDetails}>
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tickets List */}
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted">
            <TabsTrigger value="open">Open Tickets</TabsTrigger>
            {/* <TabsTrigger value="closed">Closed Tickets</TabsTrigger> */}
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading tickets...</p>
            ) : tickets.filter((ticket) => ticket && typeof ticket === "object" && "status" in ticket && ticket.status === "open").length === 0 ? (
              <p className="text-muted-foreground">No open tickets found</p>
            ) : (
              tickets
                .filter((ticket) => ticket && typeof ticket === "object" && "status" in ticket && ticket.status === "open")
                .map((ticket) => (
                  <Card key={ticket.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-lg bg-secondary/10">
                            <MessageSquare className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{ticket.subject}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>{ticket.replies_count} replies</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(ticket.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => handleViewDetails(ticket.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading tickets...</p>
            ) : tickets.filter((ticket) => ticket && typeof ticket === "object" && "status" in ticket && ticket.status === "closed").length === 0 ? (
              <p className="text-muted-foreground">No closed tickets found</p>
            ) : (
              tickets
                .filter((ticket) => ticket && typeof ticket === "object" && "status" in ticket && ticket.status === "closed")
                .map((ticket) => (
                  <Card key={ticket.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{ticket.subject}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>{ticket.replies_count} replies</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(ticket.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => handleViewDetails(ticket.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}