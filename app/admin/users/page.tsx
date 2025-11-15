"use client";

import { useState, useCallback } from "react";
import { NavHeader } from "@/components/admin-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsers } from "./hooks/useUsers";
import { useStats } from "./hooks/useStats";
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

export default function AdminUsersPage() {
  const { toast } = useToast();

  /* ---------- Data hooks ---------- */
  const {
    users = [],
    loading: usersLoading,
    pagination,
    refetch: refetchUsers,
  } = useUsers();

  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();

  const {
    detail,
    open,
    fetchDetail,
    close,
    refetch: refetchDetail,
  } = useUserDetails();

  /* ---------- UI state ---------- */
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ---------- Status change ---------- */
  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = getCookie("auth_token");
      if (!token) throw new Error("Missing auth token");

      const res = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "User status updated",
        className: "bg-primary text-primary-foreground",
      });

      // Refresh list + stats
      refetchUsers(pagination?.current_page);
      refetchStats();

      // If the dialog is open for this user, refresh it
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

  /* ---------- Sorting ---------- */
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  /* ---------- Pagination ---------- */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.last_page || 1)) {
      refetchUsers(page);
    }
  };

  /* ---------- Referral view ---------- */
  const handleViewReferral = useCallback(
    (id: number) => {
      if (!id) {
        toast({ title: "Invalid referral ID" });
        return;
      }
      fetchDetail(id);
    },
    [fetchDetail]
  );

  /* ---------- Filtering & sorting ---------- */
  const filtered = (users ?? [])
    .filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesKyc = kycFilter === "all" || u.kyc_status === kycFilter;
      return matchesSearch && matchesStatus && matchesKyc;
    })
    .sort((a, b) => {
      const sorted = sortUsers([a, b], sortField, sortDir);
      return sorted[0] === a ? -1 : 1;
    });

  /* ---------- Dialog open/close ---------- */
  const openDialog = (user: User) => {
    if (!user?.id) return;
    fetchDetail(user.id); // This will set open=true inside useUserDetails
  };

  const closeDialog = () => {
    close();
  };

  /* ---------- Stable refetch for QuickActions ---------- */
  // const refetchUserInDialog = useCallback(() => {
  //   if (selectedUser) {
  //     fetchDetail(selectedUser.id);
  //   }
  // }, [selectedUser, fetchDetail]);

  /* ---------- Render ---------- */
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all registered users
          </p>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Filters */}
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

        {/* Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <UsersTable
              users={filtered}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onView={openDialog}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <Button
              disabled={!pagination.prev_page_url || usersLoading}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              Previous
            </Button>

            <span className="text-foreground">
              Page {pagination.current_page} of {pagination.last_page} (Total:{" "}
              {pagination.total})
            </span>

            <Button
              disabled={!pagination.next_page_url || usersLoading}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* User Details Dialog */}
        <UserDetailsDialog
          open={open} 
          onOpenChange={(isOpen) => !isOpen && closeDialog()}
          user={detail} 
          onStatusChange={handleStatusChange}
          onViewUser={handleViewReferral}
          refetchUser={refetchDetail} 
        />
      </main>
    </div>
  );
}
