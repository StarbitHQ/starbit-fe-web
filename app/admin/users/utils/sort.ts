import type { User } from "../types/user";

export const sortUsers = <T extends keyof User>(
  users: User[],
  field: T,
  direction: "asc" | "desc"
): User[] => {
  const modifier = direction === "asc" ? 1 : -1;
  return [...users].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * modifier;
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * modifier;
    }
    return 0;
  });
};