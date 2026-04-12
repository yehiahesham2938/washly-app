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
import { useCenters } from "@/contexts/CentersContext";
import { areas } from "@/data/washCenters";
import { newId } from "@/lib/id";
import type { Area, Service, WashCenter } from "@/types";

const AREA_OPTIONS = areas.filter((a) => a !== "All") as Area[];

type ServiceForm = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
};

function centerToForms(c: WashCenter): ServiceForm[] {
  return c.services.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    duration: s.durationMin,
    description: s.description,
  }));
}

function formsToServices(forms: ServiceForm[]): Service[] {
  return forms.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description.trim() || `${f.name} service`,
    durationMin: f.duration,
    price: f.price,
  }));
}

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
  description: "",
  services: [],
});

export function AdminCenters() {
  const { centers, setCenters } = useCenters();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WashCenter | null>(null);
  const [form, setForm] = useState<WashCenter>(defaultCenter());
  const [serviceForms, setServiceForms] = useState<ServiceForm[]>([]);

  function openCreate() {
    setEditing(null);
    const nc = defaultCenter();
    setForm(nc);
    setServiceForms([]);
    setDialogOpen(true);
  }

  function openEdit(c: WashCenter) {
    setEditing(c);
    setForm({ ...c });
    setServiceForms(centerToForms(c));
    setDialogOpen(true);
  }

  function saveCenter() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.image.trim()) {
      toast.error("Image URL is required");
      return;
    }
    const services = formsToServices(serviceForms);
    const nextCenter: WashCenter = {
      ...form,
      services,
      reviewCount: form.reviewCount || 0,
    };

    if (editing) {
      setCenters(
        centers.map((c) => (c.id === editing.id ? nextCenter : c))
      );
      toast.success("Center updated");
    } else {
      setCenters([...centers, { ...nextCenter, id: form.id || newId() }]);
      toast.success("Center added");
    }
    setDialogOpen(false);
  }

  function deleteCenter(id: string) {
    setCenters(centers.filter((c) => c.id !== id));
    toast.success("Center deleted");
  }

  function addServiceRow() {
    setServiceForms([
      ...serviceForms,
      {
        id: newId(),
        name: "New service",
        price: 25,
        duration: 30,
        description: "",
      },
    ]);
  }

  function updateService(i: number, patch: Partial<ServiceForm>) {
    setServiceForms((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r))
    );
  }

  function removeService(i: number) {
    setServiceForms((rows) => rows.filter((_, j) => j !== i));
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
                <img
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
                        onClick={() => deleteCenter(c.id)}
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

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Area</Label>
                <Select
                  value={form.area}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, area: v as Area }))
                  }
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
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="loc">Short location (cards)</Label>
              <Input
                id="loc"
                value={form.locationLine ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, locationLine: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                value={form.hours}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hours: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
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
                        onChange={(e) =>
                          updateService(i, { name: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Price"
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
