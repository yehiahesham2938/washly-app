import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CenterImage } from "@/components/CenterImage";
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
import { fetchBookingsForMyCenters, patchBookingStatus } from "@/services/api";
import { fetchMyVendorCenters } from "@/services/api/centers";
import type { BookingRecord, BookingRecordStatus, WashCenter } from "@/types";

const STATUSES: BookingRecordStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export function VendorMyCenters() {
  const [centers, setCenters] = useState<WashCenter[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([
        fetchMyVendorCenters(),
        fetchBookingsForMyCenters(),
      ]);
      setCenters(c);
      setBookings(b);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load data");
      setCenters([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byCenter = useMemo(() => {
    const map = new Map<string, BookingRecord[]>();
    for (const b of bookings) {
      const id = b.centerId ?? "";
      if (!id) continue;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(b);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b2) =>
          new Date(b2.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return map;
  }, [bookings]);

  async function updateStatus(id: string, status: BookingRecordStatus) {
    try {
      const updated = await patchBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: updated.status } : x))
      );
      toast.success("Status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground sm:px-6">
        Loading your centers…
      </div>
    );
  }

  if (centers.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">No published centers yet</h1>
        <p className="mt-2 text-muted-foreground">
          When an admin approves a vendor request, your listing appears here and
          customer bookings show up below.
        </p>
        <Button className="mt-6 rounded-xl" asChild>
          <Link to="/become-vendor">Become a vendor</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My wash centers</h1>
          <p className="text-muted-foreground">
            Listings you own and bookings customers made at each location.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 rounded-xl"
          onClick={() => void load()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="space-y-10">
        {centers.map((c) => {
          const rows = byCenter.get(c.id) ?? [];
          return (
            <Card key={c.id} className="overflow-hidden rounded-xl border-border/60">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <CenterImage
                      src={c.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <CardDescription>
                      {c.area} · {c.address}
                    </CardDescription>
                    <Button
                      variant="link"
                      className="mt-1 h-auto p-0 text-primary"
                      asChild
                    >
                      <Link
                        to={`/centers/${encodeURIComponent(c.id)}`}
                        className="inline-flex items-center gap-1"
                      >
                        View public page
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="border-t border-border/60 pt-6">
                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No bookings for this center yet.
                  </p>
                ) : (
                  <div className="rounded-xl border border-border/60 bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="min-w-[180px] max-w-[260px]">
                            Notes
                          </TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-medium">
                              {b.userEmail}
                            </TableCell>
                            <TableCell>{b.serviceName}</TableCell>
                            <TableCell>{b.date}</TableCell>
                            <TableCell>{b.time}</TableCell>
                            <TableCell>{formatEgp(b.price)}</TableCell>
                            <TableCell className="align-top text-sm">
                              {b.notes?.trim() ? (
                                <p
                                  className="line-clamp-3 max-w-[260px] whitespace-pre-wrap"
                                  title={b.notes}
                                >
                                  {b.notes}
                                </p>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={b.status}
                                onValueChange={(v) =>
                                  updateStatus(b.id, v as BookingRecordStatus)
                                }
                              >
                                <SelectTrigger className="h-9 w-[150px] rounded-lg capitalize">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map((s) => (
                                    <SelectItem
                                      key={s}
                                      value={s}
                                      className="capitalize"
                                    >
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
