import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  centerToServiceForms,
  serviceFormsToCenterServices,
  WashCenterEditorForm,
} from "@/components/centers/WashCenterEditorForm";
import type { ServiceFormRow } from "@/components/centers/WashCenterEditorForm";
import { CenterImage } from "@/components/CenterImage";
import { useCenters } from "@/contexts/CentersContext";
import {
  ALL_WEEKDAYS,
  buildCenterSchedule,
  sortWeekdays,
} from "@/lib/dailyHours";
import { newId } from "@/lib/id";
import type { WashCenter, Weekday } from "@/types";

const defaultCenter = (): WashCenter => ({
  id: newId(),
  name: "",
  image: "",
  rating: 4.5,
  reviewCount: 0,
  area: "Downtown",
  address: "",
  locationLine: "",
  phone: "",
  hours: "Mon–Sun: 9:00 AM – 6:00 PM",
  hoursShort: "9:00 AM – 6:00 PM",
  workingDays: [...ALL_WEEKDAYS],
  description: "",
  services: [],
});

export function AdminCenters() {
  const { centers, createCenter, updateCenter, deleteCenter } = useCenters();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WashCenter | null>(null);
  const [form, setForm] = useState<WashCenter>(defaultCenter());
  const [serviceForms, setServiceForms] = useState<ServiceFormRow[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [dailyOpen, setDailyOpen] = useState("09:00");
  const [dailyClose, setDailyClose] = useState("18:00");
  const [workingDays, setWorkingDays] = useState<Weekday[]>([...ALL_WEEKDAYS]);

  const syncHoursFromFormKey = dialogOpen
    ? `${editing?.id ?? "new"}-${form.id}`
    : "closed";

  function openCreate() {
    setEditing(null);
    const nc = defaultCenter();
    setForm(nc);
    setServiceForms([]);
    setGallery([]);
    setDialogOpen(true);
  }

  function openEdit(c: WashCenter) {
    setEditing(c);
    setForm({ ...c });
    setServiceForms(centerToServiceForms(c));
    setGallery(c.gallery?.length ? [...c.gallery] : []);
    setDialogOpen(true);
  }

  async function saveCenter() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.image.trim()) {
      toast.error("Please upload a center image");
      return;
    }
    const services = serviceFormsToCenterServices(serviceForms);
    if (workingDays.length === 0) {
      toast.error("Select at least one working day");
      return;
    }
    if (services.length === 0) {
      toast.error("Add at least one service");
      return;
    }
    const sortedDays = sortWeekdays(workingDays);
    const { hours, hoursShort } = buildCenterSchedule(
      sortedDays,
      dailyOpen,
      dailyClose
    );
    const nextCenter: WashCenter = {
      ...form,
      hours,
      hoursShort,
      workingDays: sortedDays,
      services,
      reviewCount: form.reviewCount || 0,
      gallery: gallery.length > 0 ? gallery : undefined,
    };

    try {
      if (editing) {
        await updateCenter(nextCenter);
        toast.success("Center updated");
      } else {
        await createCenter({ ...nextCenter, id: form.id || newId() });
        toast.success("Center added");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save center");
    }
  }

  async function removeCenter(id: string) {
    try {
      await deleteCenter(id);
      toast.success("Center deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete center");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Centers</h2>
          <p className="text-muted-foreground">
            Manage wash locations and their services
          </p>
        </div>
        <Button className="rounded-xl" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add center
        </Button>
      </div>

      {centers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-muted-foreground">
          No centers yet. Add your first location.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {centers.map((c) => (
            <Card
              key={c.id}
              className="overflow-hidden rounded-xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <CenterImage
                  src={c.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{c.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{c.area}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  {c.services.length} service
                  {c.services.length !== 1 ? "s" : ""} · Rating{" "}
                  {c.rating.toFixed(1)}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete center?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove {c.name} and all its services from the catalog.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeCenter(c.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit center" : "Add center"}
            </DialogTitle>
            <DialogDescription>
              Services use duration in minutes. These appear on the public site.
            </DialogDescription>
          </DialogHeader>

          <WashCenterEditorForm
            form={form}
            setForm={setForm}
            serviceForms={serviceForms}
            setServiceForms={setServiceForms}
            dailyOpen={dailyOpen}
            setDailyOpen={setDailyOpen}
            dailyClose={dailyClose}
            setDailyClose={setDailyClose}
            workingDays={workingDays}
            setWorkingDays={setWorkingDays}
            gallery={gallery}
            setGallery={setGallery}
            syncHoursFromFormKey={syncHoursFromFormKey}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCenter}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
