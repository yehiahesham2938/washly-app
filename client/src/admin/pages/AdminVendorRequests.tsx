import { useCallback, useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterImage } from "@/components/CenterImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCenters } from "@/contexts/CentersContext";
import { formatEgp } from "@/lib/currency";
import {
  approveVendorRequest,
  fetchAllVendorRequests,
  rejectVendorRequest,
} from "@/services/api/vendorRequests";
import type { VendorCenterRequest } from "@/types";

function statusBadge(status: VendorCenterRequest["status"]) {
  const cls =
    status === "pending"
      ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
      : status === "approved"
        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
        : "bg-destructive/15 text-destructive";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

export function AdminVendorRequests() {
  const { refreshCenters } = useCenters();
  const [list, setList] = useState<VendorCenterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<VendorCenterRequest | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchAllVendorRequests();
      setList(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load requests");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await approveVendorRequest(id);
      toast.success("Request approved — center is now live");
      await refreshCenters();
      await load();
      setActive((cur) => (cur?.id === id ? null : cur));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await rejectVendorRequest(id);
      toast.success("Request rejected");
      await load();
      setActive((cur) => (cur?.id === id ? null : cur));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusyId(null);
    }
  }

  const pending = list.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Vendor requests</h2>
        <p className="text-muted-foreground">
          Review wash center submissions from users. Approve to publish with
          the same catalog data as admin-managed centers.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-muted-foreground">
          No vendor requests yet.
        </div>
      ) : (
        <Card className="rounded-xl border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Queue ({pending.length} pending)
            </CardTitle>
            <CardDescription>
              Open a row to see applicant profile, center fields, and images.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[200px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => {
                  const draft = r.centerDraft;
                  const name = draft?.name ?? "—";
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="font-medium">
                        {r.applicantSnapshot.name}
                        <div className="text-xs font-normal text-muted-foreground">
                          {r.applicantSnapshot.email}
                        </div>
                      </TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => setActive(r)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Review
                          </Button>
                          {r.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                className="rounded-lg"
                                disabled={busyId === r.id}
                                onClick={() => void approve(r.id)}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="rounded-lg"
                                    disabled={busyId === r.id}
                                  >
                                    <X className="mr-1 h-3.5 w-3.5" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Reject this request?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      The user can submit again later. Nothing
                                      is published.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => void reject(r.id)}
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto sm:rounded-xl">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>Vendor request</DialogTitle>
                <DialogDescription>
                  {statusBadge(active.status)} · Submitted{" "}
                  {new Date(active.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-2">
                <section>
                  <h4 className="mb-2 text-sm font-semibold">Applicant</h4>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {active.applicantSnapshot.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {active.applicantSnapshot.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {active.applicantSnapshot.phone}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      User id: {active.userId}
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold">Wash center</h4>
                  <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted">
                        {active.centerDraft?.image ? (
                          <CenterImage
                            src={active.centerDraft.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[120px] items-center justify-center text-muted-foreground">
                            No main image
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-base">
                          {active.centerDraft?.name ?? "—"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Area:</span>{" "}
                          {active.centerDraft?.area ?? "—"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Address:</span>{" "}
                          {active.centerDraft?.address ?? "—"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          {active.centerDraft?.phone ?? "—"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Hours:</span>{" "}
                          {active.centerDraft?.hours ?? "—"}
                        </p>
                        {active.centerDraft?.locationLine ? (
                          <p>
                            <span className="text-muted-foreground">
                              Card line:
                            </span>{" "}
                            {active.centerDraft.locationLine}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {(active.gallery?.length ?? 0) > 0 ? (
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Gallery
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {active.gallery.map((src, i) => (
                            <div
                              key={i}
                              className="h-20 w-28 overflow-hidden rounded-md border border-border"
                            >
                              <CenterImage
                                src={src}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {active.centerDraft?.description ? (
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {active.centerDraft.description}
                      </p>
                    ) : null}
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Services
                      </p>
                      <ul className="list-inside list-disc space-y-1">
                        {(active.centerDraft?.services ?? []).map((s) => (
                          <li key={s.id}>
                            {s.name} — {formatEgp(s.price)} · {s.durationMin}{" "}
                            min
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {active.publishedCenterId ? (
                  <p className="text-sm text-muted-foreground">
                    Published center id:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {active.publishedCenterId}
                    </code>
                  </p>
                ) : null}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {active.status === "pending" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => void reject(active.id)}
                      disabled={busyId === active.id}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => void approve(active.id)}
                      disabled={busyId === active.id}
                    >
                      Approve & publish
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setActive(null)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
