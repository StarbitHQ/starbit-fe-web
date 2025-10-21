import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "../utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { SupportTicket } from "../types/support-ticket";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

interface UseSupportTicketsResponse {
  tickets: SupportTicket[];
  loading: boolean;
  pagination: PaginationMeta | null;
  refetch: (page?: number) => void;
}

export const useSupportTickets = (): UseSupportTicketsResponse => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchTickets = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = getCookie("auth_token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${API_BASE_URL}/api/admin/support?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch support tickets");
      const data = await res.json();
      console.log(data)
      setTickets(data.data.data || []); // Extract nested 'data.data' array
      setPagination({
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        total: data.data.total,
        per_page: data.data.per_page,
        next_page_url: data.data.next_page_url,
        prev_page_url: data.data.prev_page_url,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch support tickets",
        variant: "destructive",
      });
      setTickets([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return { tickets, loading, pagination, refetch: fetchTickets };
};