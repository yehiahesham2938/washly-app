import { useEffect, useRef } from "react";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CenterImage } from "@/components/CenterImage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { areas } from "@/data/washCenters";
import {
  ALL_WEEKDAYS,
  buildCenterSchedule,
  DAY_ORDER,
  parseDailyHoursToTimeInputs,
  parseWorkingDaysFromHours,
  sortWeekdays,
} from "@/lib/dailyHours";
import type { Area, WashCenter, Weekday } from "@/types";

const AREA_OPTIONS = areas.filter((a) => a !== "All") as Area[];

/** Keep uploads small so API / localStorage stays reliable */
export const MAX_CENTER_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 6;

export type ServiceFormRow = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

type Props = {
  form: WashCenter;
  setForm: React.Dispatch<React.SetStateAction<WashCenter>>;
  serviceForms: ServiceFormRow[];
  setServiceForms: React.Dispatch<React.SetStateAction<ServiceFormRow[]>>;
  dailyOpen: string;
  setDailyOpen: (v: string) => void;
  dailyClose: string;
  setDailyClose: (v: string) => void;
  workingDays: Weekday[];
  setWorkingDays: React.Dispatch<React.SetStateAction<Weekday[]>>;
  gallery: string[];
  setGallery: React.Dispatch<React.SetStateAction<string[]>>;
  /** When true, sync open/close + working days from `form` when dialog opens or id changes */
  syncHoursFromFormKey: string;
};

export function WashCenterEditorForm({
  form,
  setForm,
  serviceForms,
  setServiceForms,
  dailyOpen,
  setDailyOpen,
  dailyClose,
  setDailyClose,
  workingDays,
  setWorkingDays,
  gallery,
  setGallery,
  syncHoursFromFormKey,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = parseDailyHoursToTimeInputs(form.hours, form.hoursShort);
    setDailyOpen(p.open);
    setDailyClose(p.close);
    const wd =
      form.workingDays && form.workingDays.length > 0
        ? sortWeekdays(form.workingDays)
        : parseWorkingDaysFromHours(form.hours);
    setWorkingDays(wd.length ? wd : [...ALL_WEEKDAYS]);
    // Intentionally only re-parse when the parent bumps `syncHoursFromFormKey` (e.g. dialog opens).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncHoursFromFormKey]);

  function addServiceRow() {
    setServiceForms((rows) => [
      ...rows,
      {
        id: `svc_${Math.random().toString(36).slice(2, 10)}`,
        name: "New service",
        price: 200,
        duration: 30,
        description: "",
      },
    ]);
  }

  function updateService(i: number, patch: Partial<ServiceFormRow>) {
    setServiceForms((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r))
    );
  }

  function removeService(i: number) {
    setServiceForms((rows) => rows.filter((_, j) => j !== i));
  }

  async function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPEG, PNG, WebP, …)");
      return;
    }
    if (file.size > MAX_CENTER_IMAGE_BYTES) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch {
      toast.error("Could not read that file");
    }
  }

  function onGallerySelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? [...e.target.files] : [];
    e.target.value = "";
    if (files.length === 0) return;

    setGallery((prev) => {
      const room = MAX_GALLERY_IMAGES - prev.length;
      if (room <= 0) {
        toast.error(`At most ${MAX_GALLERY_IMAGES} extra photos`);
        return prev;
      }
      const take = files.slice(0, room);
      void (async () => {
        const added: string[] = [];
        for (const file of take) {
          if (!file.type.startsWith("image/")) {
            toast.error("Skipped a non-image file");
            continue;
          }
          if (file.size > MAX_CENTER_IMAGE_BYTES) {
            toast.error("Each photo must be 2 MB or smaller");
            continue;
          }
          try {
            added.push(await readFileAsDataUrl(file));
          } catch {
            toast.error("Could not read a file");
          }
        }
        if (added.length === 0) return;
        setGallery((p) => [...p, ...added].slice(0, MAX_GALLERY_IMAGES));
      })();
      return prev;
    });
  }

  function removeGalleryAt(i: number) {
    setGallery((g) => g.filter((_, j) => j !== i));
  }

  function clearCenterImage() {
    setForm((f) => ({ ...f, image: "" }));
  }

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="wc-name">Name</Label>
        <Input
          id="wc-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label>Center image</Label>
        <p className="text-xs text-muted-foreground">
          Upload a photo (max 2 MB). Stored as data for this submission.
        </p>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onImageSelected}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative aspect-[16/10] w-full max-w-[280px] overflow-hidden rounded-lg border border-border bg-muted">
            {form.image ? (
              <CenterImage
                src={form.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1 p-4 text-center text-xs text-muted-foreground">
                <ImagePlus className="h-8 w-8 opacity-50" />
                No image yet
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {form.image ? "Replace image" : "Upload image"}
            </Button>
            {form.image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={clearCenterImage}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>More photos (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Up to {MAX_GALLERY_IMAGES} additional images (2 MB each).
        </p>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={onGallerySelected}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={gallery.length >= MAX_GALLERY_IMAGES}
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add photos
          </Button>
        </div>
        {gallery.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gallery.map((src, i) => (
              <div
                key={`${i}-${src.slice(0, 32)}`}
                className="relative h-20 w-28 overflow-hidden rounded-lg border border-border"
              >
                <CenterImage
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-background/90 p-1 shadow"
                  onClick={() => removeGalleryAt(i)}
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Area</Label>
          <Select
            value={form.area}
            onValueChange={(v) => setForm((f) => ({ ...f, area: v as Area }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AREA_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wc-rating">Rating</Label>
          <Input
            id="wc-rating"
            type="number"
            step="0.1"
            min={0}
            max={5}
            value={form.rating}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                rating: Number.parseFloat(e.target.value) || 0,
              }))
            }
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wc-address">Address</Label>
        <Input
          id="wc-address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wc-loc">Short location (cards)</Label>
        <Input
          id="wc-loc"
          value={form.locationLine ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, locationLine: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wc-phone">Phone</Label>
        <Input
          id="wc-phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label>Hours</Label>
        <p className="text-xs text-muted-foreground">
          Choose open days and daily open/close times. Times use your
          browser&apos;s 24-hour clock.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setWorkingDays(DAY_ORDER.slice(0, 5))}
          >
            Weekdays
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setWorkingDays([...ALL_WEEKDAYS])}
          >
            Every day
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAY_ORDER.map((d) => (
            <label
              key={d}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 px-2.5 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                className="rounded border-border"
                checked={workingDays.includes(d)}
                onChange={() => {
                  setWorkingDays((prev) => {
                    if (prev.includes(d)) {
                      return prev.filter((x) => x !== d);
                    }
                    return sortWeekdays([...prev, d]);
                  });
                }}
              />
              {d}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="wc-open-time" className="text-xs font-normal">
              Opens
            </Label>
            <Input
              id="wc-open-time"
              type="time"
              value={dailyOpen}
              onChange={(e) => setDailyOpen(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="wc-close-time" className="text-xs font-normal">
              Closes
            </Label>
            <Input
              id="wc-close-time"
              type="time"
              value={dailyClose}
              onChange={(e) => setDailyClose(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Preview:{" "}
          {workingDays.length === 0 ? (
            <span className="font-medium text-destructive">
              Select at least one working day
            </span>
          ) : (
            <span className="font-medium text-foreground">
              {
                buildCenterSchedule(workingDays, dailyOpen, dailyClose).hours
              }
            </span>
          )}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wc-desc">Description</Label>
        <Textarea
          id="wc-desc"
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>

      <div className="border-t pt-4">
        <div className="mb-2 flex items-center justify-between">
          <Label>Services</Label>
          <Button type="button" variant="outline" size="sm" onClick={addServiceRow}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add service
          </Button>
        </div>
        <div className="space-y-3">
          {serviceForms.map((s, i) => (
            <div
              key={s.id}
              className="grid gap-2 rounded-lg border border-border/60 p-3"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Service name"
                  value={s.name}
                  onChange={(e) => updateService(i, { name: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Price (EGP)"
                    value={s.price}
                    onChange={(e) =>
                      updateService(i, {
                        price: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Min"
                    value={s.duration}
                    onChange={(e) =>
                      updateService(i, {
                        duration: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <Textarea
                placeholder="Description"
                value={s.description}
                onChange={(e) =>
                  updateService(i, { description: e.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => removeService(i)}
              >
                Remove service
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function serviceFormsToCenterServices(
  forms: ServiceFormRow[]
): WashCenter["services"] {
  return forms.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description.trim() || `${f.name} service`,
    durationMin: f.duration,
    price: f.price,
  }));
}

export function centerToServiceForms(c: WashCenter): ServiceFormRow[] {
  return c.services.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    duration: s.durationMin,
    description: s.description,
  }));
}
