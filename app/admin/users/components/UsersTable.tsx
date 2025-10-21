import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { UserRow } from "./UserRow";
import type { User } from "../types/user";

interface Props {
  users: User[];
  sortField: keyof User;
  sortDir: "asc" | "desc";
  onSort: (field: keyof User) => void;
  onView: (id: number) => void;
}

export const UsersTable = ({ users, sortField, sortDir, onSort, onView }: Props) => {
  const headerClass = "text-foreground";

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("name")} className="gap-1">
                User
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Contact</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("status")} className="gap-1">
                Status
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>KYC</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("balance")} className="gap-1">
                Balance
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("total_trades")} className="gap-1">
                Trades
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Referrals</TableHead>
            <TableHead className={headerClass}>
              <Button variant="ghost" onClick={() => onSort("created_at")} className="gap-1">
                Joined
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className={headerClass}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} onView={onView} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};