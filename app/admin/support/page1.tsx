"use client";

import { useState } from "react";
import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSupportTickets } from "./hooks/useSupportTickets";
import { SupportTicketsTable } from "./components/SupportTicketsTable";
import type { SupportTicket } from "./types/support-ticket";

export default function AdminSupportPage() {
  const { toast } = useToast();
  const { tickets = [], loading, pagination, refetch: refetchTickets } = useSupportTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof SupportTicket>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ---- sorting --------------------------------------------------------------
  const handleSort = (field: keyof SupportTicket) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // ---- pagination -----------------------------------------------------------
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.last_page || 1)) {
      refetchTickets(page);
    }
  };

  // ---- filtering ------------------------------------------------------------
  const filtered = (tickets || []).filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    if (sortField === "created_at") {
      return sortDir === "asc"
        ? new Date(valueA).getTime() - new Date(valueB).getTime()
        : new Date(valueB).getTime() - new Date(valueA).getTime();
    }
    return sortDir === "asc"
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });

  // ---- render ---------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Support Ticket Management</h1>
          <p className="text-muted-foreground">View and manage all support tickets</p>
        </div>

        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by subject or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md p-2 max-w-xs"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <SupportTicketsTable
              tickets={filtered}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onView={(id) => toast({ title: "View Ticket", description: `Viewing ticket ID: ${id}` })}
            />
          </CardContent>
        </Card>

        {pagination && pagination.last_page > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <Button
              disabled={!pagination.prev_page_url || loading}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <span className="text-foreground">
              Page {pagination.current_page} of {pagination.last_page} (Total: {pagination.total})
            </span>
            <Button
              disabled={!pagination.next_page_url || loading}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}