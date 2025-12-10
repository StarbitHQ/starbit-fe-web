// UsersPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from "lucide-react";
import { NavHeader } from "@/components/admin-nav";
import { FiltersBar } from "./components/FiltersBar";
import { UsersTable } from "./components/UsersTable";
import { UserDetailsDialog } from "./components/UserDetailsDialog";
import { useUsers } from "./hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "./utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { User, UserDetail } from "./types/user";

type SortableField = "name" | "email" | "created_at" | "account_bal";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

export default function UsersPage() {
  const { toast } = useToast();

  // Use the hook
  const { users, loading, pagination, filters, setFilters, refetch } = useUsers();

  // Local state for controlled inputs (debounced)
  const [searchInput, setSearchInput] = useState("");

  // Modal state
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, setFilters]);

  // Fetch full user details when viewing
  const fetchUserDetails = useCallback(async (userId: number) => {
    setIsLoadingUser(true);
    try {
      const token = getCookie("auth_token");
      if (!token) throw new Error("No authentication token");

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user details");

      const data = await res.json();
      
      // Transform the response to match UserDetail type
      const userDetail: UserDetail = {
        ...data.user,
        status: data.user.is_blocked ? "suspended" : (data.user.email_verified_at ? "active" : "inactive"),
        email_verified: !!data.user.email_verified_at,
        two_factor_enabled: data.user.two_factor_enabled ?? false,
        account_bal: data.user.balance,
      };

      setSelectedUser(userDetail);
      setIsModalOpen(true);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUser(false);
    }
  }, [toast]);

  // Handle view user - fetch full details then open modal
  const handleViewUser = (user: User) => {
    fetchUserDetails(user.id);
  };

  // Handle viewing a user from within the modal (e.g., clicking a referral)
  const handleViewUserById = (userId: number) => {
    fetchUserDetails(userId);
  };

  // Handle status change from modal
  const handleStatusChange = async (userId: number, status: string) => {
    try {
      const token = getCookie("auth_token");
      if (!token) throw new Error("No authentication token");

      let endpoint = "";
      if (status === "suspended") {
        endpoint = `/api/admin/users/${userId}/suspend`;
      } else if (status === "active") {
        endpoint = `/api/admin/users/${userId}/unsuspend`;
      }

      if (endpoint) {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to update status");

        toast({
          title: "Success",
          description: `User status updated to ${status}`,
        });

        // Refresh user details and list
        fetchUserDetails(userId);
        refetch();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Refetch user details (called after mutations in modal)
  const handleRefetchUser = () => {
    if (selectedUser) {
      fetchUserDetails(selectedUser.id);
    }
    refetch();
  };

  // Handle sort
  const handleSort = (field: SortableField) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  // Handle KYC filter change
  const handleKycChange = (value: string) => {
    setFilters((prev) => ({ ...prev, kyc: value, page: 1 }));
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, perPage: Number(value), page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all users on the platform ({pagination.total} total)
          </p>
        </div>

        {/* Filters */}
        <FiltersBar
          search={searchInput}
          setSearch={setSearchInput}
          status={filters.status ?? "all"}
          setStatus={handleStatusFilterChange}
          kyc={filters.kyc ?? "all"}
          setKyc={handleKycChange}
          filteredUsers={users}
          isSearching={loading && !!searchInput}
        />

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <UsersTable
              users={users}
              sortField={(filters.sortBy as SortableField) ?? "created_at"}
              sortDir={filters.sortOrder ?? "desc"}
              onSort={handleSort}
              onView={handleViewUser}
              isLoading={loading || isLoadingUser}
            />

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
                  {pagination.total} users
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(filters.perPage ?? 15)}
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.current_page === 1 || loading}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="px-2 text-sm font-medium">
                      Page {pagination.current_page} of {pagination.last_page}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(pagination.last_page)}
                      disabled={pagination.current_page === pagination.last_page || loading}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <UserDetailsDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          user={selectedUser}
          onStatusChange={handleStatusChange}
          onViewUser={handleViewUserById}
          refetchUser={handleRefetchUser}
        />
      </main>
    </div>
  );
}