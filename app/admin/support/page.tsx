"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavHeader } from "@/components/admin-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Search,
  RefreshCw,
  AlertCircle,
  User,
} from "lucide-react";
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

interface TicketUser {
  id: number;
  name: string;
  email: string;
}

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  replies_count: number;
  image_url?: string;
  replies?: Reply[];
  user?: TicketUser;
  user_id: number;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function AdminSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Fetch tickets
  const fetchTickets = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const token = getCookie("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/support?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const ticketsData = result.data.data || result.data;
        const validTickets = Array.isArray(ticketsData)
          ? ticketsData.filter(
              (ticket: any) =>
                ticket &&
                typeof ticket === "object" &&
                "id" in ticket &&
                "status" in ticket
            )
          : [];

        setTickets(validTickets);

        // Set pagination info
        if (result.data.current_page) {
          setPagination({
            current_page: result.data.current_page,
            last_page: result.data.last_page,
            per_page: result.data.per_page,
            total: result.data.total,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleViewDetails = async (ticketId: number) => {
    try {
      const token = getCookie("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/support/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ticket details");
      }

      const data = await response.json();
      if (
        data.ticket &&
        typeof data.ticket === "object" &&
        "status" in data.ticket
      ) {
        setSelectedTicket(data.ticket);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load ticket details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const token = getCookie("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/support/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ticket status");
      }

      const result = await response.json();

      // Update local state
      setTickets(
        tickets.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus } : t
        )
      );

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }

      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus}`,
        className: "bg-primary text-primary-foreground",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 gap-1">
            <Clock className="h-3 w-3" />
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 gap-1">
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getTicketsByStatus = (status: string) => {
    return filteredTickets.filter((ticket) => ticket.status === status);
  };

  const renderTicketCard = (ticket: Ticket) => (
    <Card
      key={ticket.id}
      className="bg-card border-border hover:border-primary/50 transition-colors"
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                {ticket.subject}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {ticket.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                {ticket.user && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{ticket.user.name}</span>
                  </div>
                )}
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span>{ticket.replies_count} replies</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {getStatusBadge(ticket.status)}
              <Select
                value={ticket.status}
                onValueChange={(value) => handleUpdateStatus(ticket.id, value)}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}

        <NavHeader isAuthenticated />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Support Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage all user support tickets
            </p>
          </div>
          <Button
            onClick={() => fetchTickets(pagination.current_page)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {tickets.filter((t) => t.status === "open").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tickets.filter((t) => t.status === "in_progress").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tickets.filter((t) => t.status === "resolved").length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by subject, description, user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl bg-card border-border max-h-[85vh] overflow-y-auto">
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-foreground mb-2">
                      {selectedTicket.subject}
                    </CardTitle>
                    {selectedTicket.user && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{selectedTicket.user.name}</span>
                        <span>({selectedTicket.user.email})</span>
                      </div>
                    )}
                    <CardDescription className="text-muted-foreground mt-1">
                      Created:{" "}
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Description
                  </h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
                {selectedTicket.image_url && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Attachment
                    </h4>
                    <img
                      src={
                        selectedTicket.image_url.startsWith("http")
                          ? selectedTicket.image_url
                          : `${API_BASE_URL}${selectedTicket.image_url}`
                      }
                      alt="Ticket attachment"
                      className="w-full max-w-md rounded-lg border border-border"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    Update Status
                  </h4>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedTicket.status)}
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) =>
                        handleUpdateStatus(selectedTicket.id, value)
                      }
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Replies ({selectedTicket.replies?.length || 0})
                  </h4>
                  {selectedTicket.replies &&
                  selectedTicket.replies.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="border-l-2 border-primary/20 pl-4 py-2 bg-muted/30 rounded-r"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-foreground">
                              {reply.user.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No replies yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tickets List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted">
            <TabsTrigger value="all">
              All ({filteredTickets.length})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({getTicketsByStatus("open").length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({getTicketsByStatus("in_progress").length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({getTicketsByStatus("resolved").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading tickets...
              </p>
            ) : filteredTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tickets found
              </p>
            ) : (
              filteredTickets.map(renderTicketCard)
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading tickets...
              </p>
            ) : getTicketsByStatus("open").length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No open tickets
              </p>
            ) : (
              getTicketsByStatus("open").map(renderTicketCard)
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading tickets...
              </p>
            ) : getTicketsByStatus("in_progress").length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tickets in progress
              </p>
            ) : (
              getTicketsByStatus("in_progress").map(renderTicketCard)
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading tickets...
              </p>
            ) : getTicketsByStatus("resolved").length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No resolved tickets
              </p>
            ) : (
              getTicketsByStatus("resolved").map(renderTicketCard)
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => fetchTickets(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              onClick={() => fetchTickets(pagination.current_page + 1)}
              disabled={
                pagination.current_page === pagination.last_page || isLoading
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
