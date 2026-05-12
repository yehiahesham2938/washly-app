import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";

import type { CenterRevenueRow } from "@/admin/components/revenueAnalytics";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEgp } from "@/lib/currency";

type SortBy = "name" | "completed" | "total" | "platform";
type SortDir = "asc" | "desc";

type Props = {
  rows: CenterRevenueRow[];
};

export function CentersRevenueTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filteredSortedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((row) => row.centerName.toLowerCase().includes(q))
      : rows;

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const compare = a.centerName.localeCompare(b.centerName);
        return sortDir === "asc" ? compare : -compare;
      }

      const aValue =
        sortBy === "completed"
          ? a.completedBookings
          : sortBy === "platform"
            ? a.platformRevenue
            : a.totalRevenue;
      const bValue =
        sortBy === "completed"
          ? b.completedBookings
          : sortBy === "platform"
            ? b.platformRevenue
            : b.totalRevenue;
      return sortDir === "asc" ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [query, rows, sortBy, sortDir]);

  const empty = filteredSortedRows.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by center name"
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={`${sortBy}:${sortDir}`}
            onValueChange={(value) => {
              const [nextSortBy, nextSortDir] = value.split(":") as [
                SortBy,
                SortDir,
              ];
              setSortBy(nextSortBy);
              setSortDir(nextSortDir);
            }}
          >
            <SelectTrigger className="w-[200px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total:desc">Highest revenue</SelectItem>
              <SelectItem value="total:asc">Lowest revenue</SelectItem>
              <SelectItem value="platform:desc">Highest platform cut</SelectItem>
              <SelectItem value="completed:desc">Most bookings</SelectItem>
              <SelectItem value="name:asc">Center name A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="h-9 rounded-lg px-3">
            <ArrowDownUp className="mr-1 h-3.5 w-3.5" />
            {filteredSortedRows.length} centers
          </Badge>
        </div>
      </div>

      {empty ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
          No center revenue found for this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center Name</TableHead>
                <TableHead>Completed Bookings</TableHead>
                <TableHead>Cash Revenue</TableHead>
                <TableHead>Visa Revenue</TableHead>
                <TableHead>Wallet Revenue</TableHead>
                <TableHead>Total Revenue</TableHead>
                      <TableHead>Platform Revenue (20%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSortedRows.map((row) => (
                <TableRow key={row.centerName}>
                  <TableCell className="font-medium">{row.centerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.completedBookings}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">{formatEgp(row.cashRevenue)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{formatEgp(row.visaRevenue)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatEgp(row.walletRevenue)}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatEgp(row.totalRevenue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">{formatEgp(row.platformRevenue)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
