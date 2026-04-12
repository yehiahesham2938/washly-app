import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import type { BookingRecordStatus } from "@/types";

const STATUSES: BookingRecordStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export function AdminBookings() {
  const { allBookingRecords, updateBookingStatus, deleteBookingRecord } =
    useAuth();

  const sorted = useMemo(
    () =>
      [...allBookingRecords].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [allBookingRecords]
  );

  async function updateStatus(id: string, status: BookingRecordStatus) {
    try {
      await updateBookingStatus(id, status);
      toast.success("Booking status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update status");
    }
  }

  async function removeBooking(id: string) {
    try {
      await deleteBookingRecord(id);
      toast.success("Booking removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove booking");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground">
          Manage all customer bookings and statuses
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-muted-foreground">
          No bookings yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="min-w-[200px] max-w-[280px]">
                  Client notes
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.userEmail}</TableCell>
                  <TableCell>{b.centerName ?? "—"}</TableCell>
                  <TableCell>{b.serviceName}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>{b.time}</TableCell>
                  <TableCell>${b.price}</TableCell>
                  <TableCell className="align-top text-sm">
                    {b.notes?.trim() ? (
                      <p
                        className="line-clamp-4 max-w-[280px] whitespace-pre-wrap text-foreground"
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
                      <SelectTrigger className="h-9 w-[150px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the booking permanently from storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeBooking(b.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
