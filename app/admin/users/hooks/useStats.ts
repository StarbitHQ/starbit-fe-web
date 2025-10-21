import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "../utils/cookie";
import { API_BASE_URL } from "@/lib/api";

interface Stats {
  total_users: number;
  total_admins: number;
  total_regular_users: number;
  verified_users: number;
  unverified_users: number;
  users_by_role: {
    superadmin: number;
    admin: number;
    manager: number;
    moderator: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    type: string;
    created_at: string;
  }>;
  // Add these if the backend supports them
  active_users?: number;
  suspended_users?: number;
}

interface UseStatsResponse {
  stats: Stats | null;
  loading: boolean;
  refetch: () => void;
}

export const useStats = (): UseStatsResponse => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = getCookie("auth_token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${API_BASE_URL}/api/admin/users/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch stats",
        variant: "destructive",
      });
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};