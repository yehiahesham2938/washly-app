import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatEgp } from "@/lib/currency";
import {
  createHomePackage,
  deleteHomePackage,
  fetchHomePackages,
  updateHomePackage,
} from "@/services/api/homePackages";
import type { HomePackage } from "@/types";

/* ─── form helpers ─────────────────────────────────────────────────────────── */

type FormState = {
  name: string;
  description: string;
  durationMin: string;
  price: string;
  features: string; // newline-separated in textarea
};

const emptyForm = (): FormState => ({
  name: "",
  description: "",
  durationMin: "",
  price: "",
  features: "",
});

function packageToForm(pkg: HomePackage): FormState {
  return {
    name: pkg.name,
    description: pkg.description ?? "",
    durationMin: String(pkg.durationMin),
    price: String(pkg.price),
    features: pkg.features.join("\n"),
  };
}

function formToPayload(f: FormState) {
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    durationMin: Number(f.durationMin),
    price: Number(f.price),
    features: f.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function validate(f: FormState): string | null {
  if (!f.name.trim()) return "Package name is required.";
  if (!f.durationMin || Number(f.durationMin) < 1)
    return "Duration must be at least 1 minute.";
  if (f.price === "" || Number(f.price) < 0)
    return "Price must be 0 or more.";
  return null;
}

/* ─── PackageDialog ─────────────────────────────────────────────────────────── */

type DialogProps = {
  open: boolean;
  onClose: () => void;
  editing: HomePackage | null;
  onSaved: (pkg: HomePackage) => void;
};

function PackageDialog({ open, onClose, editing, onSaved }: DialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(editing ? packageToForm(editing) : emptyForm());
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open, editing]);

  function field(key: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(form);
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const saved = editing
        ? await updateHomePackage(editing.id, payload)
        : await createHomePackage(payload);
      onSaved(saved);
      toast.success(editing ? "Package updated." : "Package created.");
      onClose();
    } catch (ex) {
      toast.error(ex instanceof Error ? ex.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit package" : "New home service package"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="pkg-name">Name *</Label>
            <Input
              id="pkg-name"
              ref={nameRef}
              placeholder="e.g. Premium Wash"
              value={form.name}
              onChange={field("name")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pkg-desc">Description</Label>
            <Textarea
              id="pkg-desc"
              placeholder="Short description shown on the booking page…"
              rows={2}
              value={form.description}
              onChange={field("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-dur">Duration (minutes) *</Label>
              <Input
                id="pkg-dur"
                type="number"
                min={1}
                placeholder="60"
                value={form.durationMin}
                onChange={field("durationMin")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price">Price (EGP) *</Label>
              <Input
                id="pkg-price"
                type="number"
                min={0}
                placeholder="250"
                value={form.price}
                onChange={field("price")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pkg-features">
              Features{" "}
              <span className="text-xs text-muted-foreground">
                (one per line)
              </span>
            </Label>
            <Textarea
              id="pkg-features"
              placeholder={"Exterior wash\nInterior vacuum\nWheels cleaning"}
              rows={4}
              value={form.features}
              onChange={field("features")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── PackageCard ───────────────────────────────────────────────────────────── */

type CardProps = {
  pkg: HomePackage;
  onEdit: () => void;
  onDelete: () => void;
};

function PackageCard({ pkg, onEdit, onDelete }: CardProps) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5">
      <CardContent className="p-5 space-y-4">
        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="font-semibold text-base leading-tight truncate">
              {pkg.name}
            </p>
            {pkg.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {pkg.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onEdit}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{pkg.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the package permanently. Existing bookings won't be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* meta badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {pkg.durationMin} min
          </Badge>
          <Badge variant="success" className="gap-1 font-semibold">
            {formatEgp(pkg.price)}
          </Badge>
        </div>

        {/* features */}
        {pkg.features.length > 0 && (
          <ul className="space-y-1">
            {pkg.features.map((feat) => (
              <li
                key={feat}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {feat}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── AdminHomePackages ─────────────────────────────────────────────────────── */

export function AdminHomePackages() {
  const [packages, setPackages] = useState<HomePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HomePackage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchHomePackages();
      setPackages(list);
    } catch {
      toast.error("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(pkg: HomePackage) { setEditing(pkg); setDialogOpen(true); }

  function handleSaved(pkg: HomePackage) {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      if (idx === -1) return [...prev, pkg];
      return prev.map((p) => (p.id === pkg.id ? pkg : p));
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteHomePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Package deleted.");
    } catch (ex) {
      toast.error(ex instanceof Error ? ex.message : "Delete failed.");
    }
  }

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Home Service Packages
          </h2>
          <p className="text-muted-foreground">
            Manage offers and bundles available for home wash bookings.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add package
        </Button>
      </div>

      {/* content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-lg">No packages yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Add package" to create your first home service offer.
          </p>
          <Button variant="outline" onClick={openCreate} className="mt-2 gap-2">
            <Plus className="h-4 w-4" />
            Add package
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={() => openEdit(pkg)}
              onDelete={() => handleDelete(pkg.id)}
            />
          ))}
        </div>
      )}

      <PackageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
