// UsersTable.tsx
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { UserRow } from "./UserRow";
import type { User } from "../types/user";

type SortableField = "name" | "email" | "created_at" | "account_bal";

interface Props {
  users: User[];
  sortField: SortableField;
  sortDir: "asc" | "desc";
  onSort: (field: SortableField) => void;
  onView: (user: User) => void;
  isLoading?: boolean;
}

export const UsersTable = ({
  users,
  sortField,
  sortDir,
  onSort,
  onView,
  isLoading = false,
}: Props) => {
  const headerClass = "text-foreground";

  const getSortIcon = (field: SortableField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortableField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="gap-1 -ml-3"
      disabled={isLoading}
    >
      {children}
      {getSortIcon(field)}
    </Button>
  );

  return (
    <div className="overflow-x-auto relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={headerClass}>
              <SortableHeader field="name">User</SortableHeader>
            </TableHead>
            <TableHead className={headerClass}>
              <SortableHeader field="email">Contact</SortableHeader>
            </TableHead>
            <TableHead className={headerClass}>Status</TableHead>
            <TableHead className={headerClass}>KYC</TableHead>
            <TableHead className={headerClass}>
              <SortableHeader field="account_bal">Balance</SortableHeader>
            </TableHead>
            <TableHead className={headerClass}>Trades</TableHead>
            <TableHead className={headerClass}>Referrals</TableHead>
            <TableHead className={headerClass}>
              <SortableHeader field="created_at">Joined</SortableHeader>
            </TableHead>
            <TableHead className={headerClass}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => <UserRow key={u.id} user={u} onView={onView} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
};