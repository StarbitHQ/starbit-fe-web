import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download } from "lucide-react";
import { exportUsersCsv } from "../utils/exportCsv";
import type { User } from "../types/user";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  kyc: string;
  setKyc: (v: string) => void;
  filteredUsers: User[];
}

export const FiltersBar = ({
  search,
  setSearch,
  status,
  setStatus,
  kyc,
  setKyc,
  filteredUsers,
}: Props) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-background border-input text-foreground"
        />
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full md:w-[180px] bg-background border-input text-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      <Select value={kyc} onValueChange={setKyc}>
        <SelectTrigger className="w-full md:w-[180px] bg-background border-input text-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="KYC Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All KYC</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={() => exportUsersCsv(filteredUsers)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
};