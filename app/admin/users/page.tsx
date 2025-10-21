"use client";

import { useState } from "react";
import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent } from "@/components/ui/card";
import { useUsers } from "./hooks/useUsers";
import { useStats } from "./hooks/useStats"; // Import the new hook
import { useUserDetails } from "./hooks/useUserDetails";
import { StatsCards } from "./components/StatsCards";
import { FiltersBar } from "./components/FiltersBar";
import { UsersTable } from "./components/UsersTable";
import { UserDetailsDialog } from "./components/UserDetailsDialog";
import { sortUsers } from "./utils/sort";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "./utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { User } from "./types/user";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { users = [], loading: usersLoading, pagination, refetch: refetchUsers } = useUsers();
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(); // Use the stats hook
  const { detail, open, fetchDetail, close, setDetail } = useUserDetails();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ---- status change handler -------------------------------------------------
  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = getCookie("auth_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "User status updated",
        className: "bg-primary text-primary-foreground",
      });

      refetchUsers(pagination?.current_page); // Refetch current page
      refetchStats(); // Refetch stats to update counts
      if (detail?.id === userId) {
        fetchDetail(userId);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  // ---- sorting --------------------------------------------------------------
  const handleSort = (field: keyof User) => {
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
      refetchUsers(page);
    }
  };

  // ---- filtering ------------------------------------------------------------
  const filtered = (users || []).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesKyc = kycFilter === "all" || u.kyc_status === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
  }).sort((a, b) => {
    const sorted = sortUsers([a, b], sortField, sortDir);
    return sorted[0] === a ? -1 : 1;
  });

  // ---- render ---------------------------------------------------------------
  if (usersLoading && statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>

        <StatsCards stats={stats} loading={statsLoading} />

        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-6">
            <FiltersBar
              search={search}
              setSearch={setSearch}
              status={statusFilter}
              setStatus={setStatusFilter}
              kyc={kycFilter}
              setKyc={setKycFilter}
              filteredUsers={filtered}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <UsersTable
              users={filtered}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onView={fetchDetail}
            />
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <Button
              disabled={!pagination.prev_page_url || usersLoading}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <span className="text-foreground">
              Page {pagination.current_page} of {pagination.last_page} (Total: {pagination.total})
            </span>
            <Button
              disabled={!pagination.next_page_url || usersLoading}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        <UserDetailsDialog
          open={open}
          onOpenChange={close}
          user={detail}
          onStatusChange={handleStatusChange}
          onViewUser={fetchDetail}
        />
      </main>
    </div>
  );
}