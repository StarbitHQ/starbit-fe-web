import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "../utils/cookie";
import { API_BASE_URL } from "@/lib/api";
import type { UserDetail } from "../types/user";

export const useUserDetails = () => {
  const { toast } = useToast();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [open, setOpen] = useState(false);

  const fetchDetail = async (userId: number) => {
    try {
      const token = getCookie("auth_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setDetail(data.user);
      setOpen(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    }
  };

  const close = () => setOpen(false);

  return { detail, open, fetchDetail, close, setDetail };
};