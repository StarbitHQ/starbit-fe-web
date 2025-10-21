import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "../utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { User } from "../types/user";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

interface UseUsersResponse {
  users: User[];
  loading: boolean;
  pagination: PaginationMeta | null;
  refetch: (page?: number) => void;
}

export const useUsers = (): UseUsersResponse => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = getCookie("auth_token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${API_BASE_URL}/api/admin/users?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        per_page: data.per_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch users",
        variant: "destructive",
      });
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, pagination, refetch: fetchUsers };
};