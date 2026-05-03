import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  serviceFormsToCenterServices,
  WashCenterEditorForm,
} from "@/components/centers/WashCenterEditorForm";
import type { ServiceFormRow } from "@/components/centers/WashCenterEditorForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  ALL_WEEKDAYS,
  buildCenterSchedule,
  sortWeekdays,
} from "@/lib/dailyHours";
import { newId } from "@/lib/id";
import { submitVendorRequest } from "@/services/api/vendorRequests";
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

export function BecomeVendor() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<WashCenter>(defaultCenter());
  const [serviceForms, setServiceForms] = useState<ServiceFormRow[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [dailyOpen, setDailyOpen] = useState("09:00");
  const [dailyClose, setDailyClose] = useState("18:00");
  const [workingDays, setWorkingDays] = useState<Weekday[]>([...ALL_WEEKDAYS]);
  const [submitting, setSubmitting] = useState(false);

  const syncHoursFromFormKey = dialogOpen ? `vendor-${form.id}` : "closed";

  function openDialog() {
    const nc = defaultCenter();
    setForm(nc);
    setServiceForms([]);
    setGallery([]);
    setDialogOpen(true);
  }

  async function submitRequest() {
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

    const galleryPayload = gallery.length > 0 ? gallery : [];
    const { id: _cid, gallery: _g, ownerUserId: _o, ...draft } = nextCenter;

    setSubmitting(true);
    try {
      await submitVendorRequest({
        centerDraft: draft,
        gallery: galleryPayload,
      });
      toast.success("Your request was sent. An admin will review it soon.");
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Become a vendor</h1>
        <p className="mt-2 text-muted-foreground">
          List your wash center on Washly. Submit one request per location. Our
          team reviews every application before it goes live.
        </p>
      </div>

      <Card className="mb-8 rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your profile</CardTitle>
          <CardDescription>
            These details are shared with admins together with your center
            information.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 text-sm">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Name</p>
              <p className="text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Email</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm sm:col-span-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Phone</p>
              <p className="text-muted-foreground">{user.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Your wash center
          </CardTitle>
          <CardDescription>
            Use the same form as our admins: photos, address, hours, services,
            and optional gallery.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            When you are ready, add your center. You can submit multiple
            requests for different locations.
          </p>
          <Button
            type="button"
            className="shrink-0 rounded-xl"
            onClick={openDialog}
          >
            Add your wash center
          </Button>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/centers" className="text-primary hover:underline">
          Browse existing centers
        </Link>
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Publish request — wash center</DialogTitle>
            <DialogDescription>
              Everything you enter here is sent to the Washly admin team for
              approval.
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
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
