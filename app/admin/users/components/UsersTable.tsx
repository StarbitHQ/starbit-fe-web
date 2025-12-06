import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { UserRow } from "./UserRow";
import type { User } from "../types/user";

interface Props {
  users: User[];
  sortField: keyof User;
  sortDir: "asc" | "desc";
  onSort: (field: keyof User) => void;
  onView: (user: User) => void;  
}

export const UsersTable = ({ users, sortField, sortDir, onSort, onView }: Props) => {
  const headerClass = "text-foreground";

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("name")} className="gap-1">
                User
                {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Contact</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("status")} className="gap-1">
                Status
                {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead className={headerClass}>KYC</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("account_bal")} className="gap-1">
                Balance
                {getSortIcon("account_bal")}
              </Button>
            </TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("total_trades")} className="gap-1">
                Trades
                {getSortIcon("total_trades")}
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Referrals</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("created_at")} className="gap-1">
                Joined
                {getSortIcon("created_at")}
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <UserRow key={u.id} user={u} onView={onView} />  
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};