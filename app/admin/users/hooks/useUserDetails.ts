import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "../utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { UserDetail } from "../types/user";

export const useUserDetails = () => {
  const { toast } = useToast();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

const fetchDetail = useCallback(async (userId: number) => {
  if (!userId || isNaN(userId)) {
    console.warn("Invalid userId:", userId);
    toast({
      title: "Error",
      description: "Invalid user ID",
      variant: "destructive",
    });
    setOpen(false);
    return;
  }

  setLoading(true);

    try {
      const token = getCookie("auth_token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch user details");
      }

      const data = await res.json();
      const user: UserDetail = data.user;

      // Ensure nested objects exist to prevent crashes in UI
      const safeUser: UserDetail = {
        ...user,
        referrals: user.referrals ?? { total_count: 0, referrals: [] },
        trades: user.trades ?? { total_count: 0, total_invested: 0, trades: [] },
        admin: user.admin ?? null,
      };

      setDetail(safeUser);
      setOpen(true);
    } catch (err: any) {
      console.error("useUserDetails error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch user details",
        variant: "destructive",
      });
      setDetail(null);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refetch = useCallback(
    (userId?: number) => {
      if (userId !== undefined) {
        return fetchDetail(userId);
      }
      if (detail?.id) {
        return fetchDetail(detail.id);
      }
    },
    [detail?.id, fetchDetail]
  );

  const close = useCallback(() => {
    setOpen(false);
    // Optionally clear detail after close animation
    setTimeout(() => {
      if (!open) setDetail(null);
    }, 300);
  }, [open]);

  return {
    detail,
    open,
    loading,
    fetchDetail,
    refetch,
    close,
  };
};