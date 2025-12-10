// useUsers.ts
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "../utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { User } from "../types/user";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number | null;
  to: number | null;
}

interface UseUsersFilters {
  search?: string;
  status?: string;
  kyc?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

interface UseUsersResponse {
  users: User[];
  loading: boolean;
  pagination: PaginationMeta;
  refetch: (filters?: UseUsersFilters) => Promise<void>;
  filters: UseUsersFilters;
  setFilters: React.Dispatch<React.SetStateAction<UseUsersFilters>>;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15,
  from: null,
  to: null,
};

const DEFAULT_FILTERS: UseUsersFilters = {
  search: "",
  status: "all",
  kyc: "all",
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  perPage: 15,
};

export const useUsers = (initialFilters?: UseUsersFilters): UseUsersResponse => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState<UseUsersFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [hasMounted, setHasMounted] = useState(false);

  // Prevent hydration mismatch by only fetching after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchUsers = useCallback(
    async (overrideFilters?: UseUsersFilters) => {
      const currentFilters = overrideFilters ?? filters;

      try {
        setLoading(true);
        const token = getCookie("auth_token");
        if (!token) throw new Error("No authentication token found");

        // Build query params
        const params = new URLSearchParams();
        params.append("page", String(currentFilters.page ?? 1));
        params.append("per_page", String(currentFilters.perPage ?? 15));

        if (currentFilters.search?.trim()) {
          params.append("search", currentFilters.search.trim());
        }
        if (currentFilters.status && currentFilters.status !== "all") {
          params.append("status", currentFilters.status);
        }
        if (currentFilters.kyc && currentFilters.kyc !== "all") {
          params.append("kyc", currentFilters.kyc);
        }
        if (currentFilters.sortBy) {
          params.append("sort_by", currentFilters.sortBy);
        }
        if (currentFilters.sortOrder) {
          params.append("sort_order", currentFilters.sortOrder);
        }

        const res = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();

        // Handle both response formats (direct Laravel pagination or wrapped)
        if (data.success !== undefined) {
          // Wrapped format: { success: true, data: [...], meta: {...} }
          setUsers(data.data || []);
          setPagination(data.meta || DEFAULT_PAGINATION);
        } else {
          // Direct Laravel pagination format
          setUsers(data.data || []);
          setPagination({
            current_page: data.current_page ?? 1,
            last_page: data.last_page ?? 1,
            total: data.total ?? 0,
            per_page: data.per_page ?? 15,
            from: data.from ?? null,
            to: data.to ?? null,
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch users",
          variant: "destructive",
        });
        setUsers([]);
        setPagination(DEFAULT_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [filters, toast]
  );

  // Initial fetch after mount
  useEffect(() => {
    if (hasMounted) {
      fetchUsers();
    }
  }, [hasMounted]); // Only run on mount

  // Refetch when filters change (after initial mount)
  useEffect(() => {
    if (hasMounted) {
      fetchUsers();
    }
  }, [
    filters.search,
    filters.status,
    filters.kyc,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.perPage,
  ]);

  return {
    users,
    loading,
    pagination,
    refetch: fetchUsers,
    filters,
    setFilters,
  };
};