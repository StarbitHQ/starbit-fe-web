// UsersPage.tsx
"use client";

import { useState, useEffect } from "react";
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
import { useUsers } from "./hooks/useUsers";
import type { User } from "./types/user";

type SortableField = "name" | "email" | "created_at" | "account_bal";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

export default function UsersPage() {
  // Use the hook
  const { users, loading, pagination, filters, setFilters } = useUsers();

  // Local state for controlled inputs (debounced)
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
  const handleStatusChange = (value: string) => {
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

  // Handle view user
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    // Open your modal here or navigate to user detail page
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
          setStatus={handleStatusChange}
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
              isLoading={loading}
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

        {/* User Detail Modal would go here */}
        {/* {selectedUser && (
          <UserDetailModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )} */}
      </main>
    </div>
  );
}