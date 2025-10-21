export const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    suspended: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    inactive: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  };
  return map[status] ?? map.inactive;
};

export const getKycBadge = (status: string) => {
  const map: Record<string, string> = {
    verified: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    none: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  };
  return map[status] ?? map.none;
};