import type { User } from "../types/user";

export const exportUsersCsv = (users: User[]) => {
  const header = [
    "Name",
    "Email",
    "Status",
    "Balance",
    "Total Trades",
    "KYC Status",
    "Created At",
  ].join(",");

  const rows = users.map((u) =>
    [
      u.name,
      u.email,
      u.status,
      u.balance,
      u.total_trades,
      u.kyc_status,
      u.created_at,
    ].join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-${new Date().toISOString()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};