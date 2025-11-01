"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

import { createAppointmentType } from "@/actions/create-appointment-type";
import { updateAppointmentType } from "@/actions/update-appointment-type";
import { deleteAppointmentType } from "@/actions/delete-appointment-type";
import { CreateAppointmentTypeSchema } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

type CreateFormData = z.infer<typeof CreateAppointmentTypeSchema>;

interface AppointmentType {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  color: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface AppointmentTypesFormProps {
  organizationId: string;
  appointmentTypes: AppointmentType[];
  onUpdate?: () => void;
}

export function AppointmentTypesForm({ organizationId, appointmentTypes: initialAppointmentTypes, onUpdate }: AppointmentTypesFormProps) {
  const router = useRouter();
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(initialAppointmentTypes);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [loading, setLoading] = useState(false);

  // Update local state when initial appointment types change (from parent refetch)
  useEffect(() => {
    setAppointmentTypes(initialAppointmentTypes);
  }, [initialAppointmentTypes]);

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(CreateAppointmentTypeSchema),
    defaultValues: {
      organizationId,
      name: "",
      description: "",
      duration: 30,
      color: "",
      isActive: true,
    },
  });

  const updateForm = useForm<CreateFormData>({
    resolver: zodResolver(CreateAppointmentTypeSchema),
    defaultValues: {
      organizationId,
      name: "",
      description: "",
      duration: 30,
      color: "",
      isActive: true,
    },
  });

  // Reset create form when dialog opens/closes
  useEffect(() => {
    if (!createDialogOpen) {
      createForm.reset({
        organizationId,
        name: "",
        description: "",
        duration: 30,
        color: "",
        isActive: true,
      });
    }
  }, [createDialogOpen, organizationId, createForm]);

  // Set update form values when editing
  useEffect(() => {
    if (editingType) {
      updateForm.reset({
        organizationId,
        name: editingType.name,
        description: editingType.description || "",
        duration: editingType.duration,
        color: editingType.color || "",
        isActive: editingType.isActive,
      });
    }
  }, [editingType, organizationId, updateForm]);

  const onCreateSubmit = async (data: CreateFormData) => {
    setLoading(true);
    try {
      const result = await createAppointmentType(data);
      if (result.success) {
        toast.success(result.message);
        setCreateDialogOpen(false);
        router.refresh();
        // Update local state
        if (result.appointmentType) {
          setAppointmentTypes([result.appointmentType, ...appointmentTypes]);
        }
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSubmit = async (data: CreateFormData) => {
    if (!editingType) return;

    setLoading(true);
    try {
      const result = await updateAppointmentType({
        id: editingType.id,
        ...data,
      });
      if (result.success) {
        toast.success(result.message);
        setEditingType(null);
        router.refresh();
        // Update local state
        setAppointmentTypes(appointmentTypes.map((type) =>
          type.id === editingType.id
            ? { ...type, ...data, id: type.id }
            : type
        ));
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment type?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteAppointmentType(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        // Update local state
        setAppointmentTypes(appointmentTypes.filter((type) => type.id !== id));
        onUpdate?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: AppointmentType) => {
    setEditingType(type);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim();
    }
    return `${mins}m`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment Types</CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Appointment Type</DialogTitle>
                  <DialogDescription>
                    Define a new appointment type for your organization.
                  </DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Consultation, Follow-up" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Brief description of this appointment type"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={1440}
                                placeholder="30"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value || "#3b82f6"}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="h-10 w-20 p-1"
                                />
                                <Input
                                  placeholder="#3b82f6"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>Hex color code</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={createForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked: boolean | "indeterminate") => field.onChange(!!checked)}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Active</FormLabel>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {appointmentTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No appointment types yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointmentTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {type.color && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{type.name}</h3>
                        {!type.isActive && (
                          <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      {type.description && (
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Duration: {formatDuration(type.duration)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingType?.id === type.id} onOpenChange={(open) => !open && setEditingType(null)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(type)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {editingType?.id === type.id && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Appointment Type</DialogTitle>
                            <DialogDescription>
                              Update the appointment type details.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...updateForm}>
                            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                              <FormField
                                control={updateForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., Consultation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={updateForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        rows={3}
                                        placeholder="Brief description"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={updateForm.control}
                                  name="duration"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Duration (minutes)*</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min={1}
                                          max={1440}
                                          placeholder="30"
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={updateForm.control}
                                  name="color"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Color</FormLabel>
                                      <FormControl>
                                        <div className="flex gap-2">
                                          <Input
                                            type="color"
                                            {...field}
                                            value={field.value || "#3b82f6"}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="h-10 w-20 p-1"
                                          />
                                          <Input
                                            placeholder="#3b82f6"
                                            {...field}
                                            value={field.value || ""}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormDescription>Hex color code</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={updateForm.control}
                                name="isActive"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked: boolean | "indeterminate") => field.onChange(!!checked)}
                                      />
                                    </FormControl>
                                    <FormLabel className="!mt-0">Active</FormLabel>
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingType(null)}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                  {loading ? "Updating..." : "Update"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(type.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

