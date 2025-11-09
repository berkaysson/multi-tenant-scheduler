"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react";

import { createUnavailableDate } from "@/actions/create-unavailable-date";
import { deleteUnavailableDate } from "@/actions/delete-unavailable-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface UnavailableDate {
  id: string;
  date: Date | string;
  reason: string | null;
}

interface UnavailableDatesFormProps {
  organizationId: string;
  unavailableDates: UnavailableDate[];
  onUpdate?: () => void;
}

const CreateFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().optional(),
});

type CreateFormData = z.infer<typeof CreateFormSchema>;

export function UnavailableDatesForm({
  organizationId,
  unavailableDates: initialUnavailableDates,
  onUpdate,
}: UnavailableDatesFormProps) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CreateFormData>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: {
      date: "",
      reason: "",
    },
  });

  const handleCreate = async (data: CreateFormData) => {
    setLoading(true);

    const result = await createUnavailableDate({
      organizationId,
      date: data.date,
      reason: data.reason || undefined,
    });

    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      form.reset();
      if (onUpdate) {
        onUpdate();
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unavailable date?")) {
      return;
    }

    setDeletingId(id);
    const result = await deleteUnavailableDate({ id });

    setDeletingId(null);

    if (result.success) {
      toast.success(result.message);
      if (onUpdate) {
        onUpdate();
      }
    } else {
      toast.error(result.message);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'UTC', // Ensure date is not shifted by timezone
    });
  };

  const sortedDates = [...initialUnavailableDates].sort((a, b) => {
    const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
    const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Unavailable Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4 mb-6 pb-6 border-b"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Holiday, Maintenance"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Unavailable Date
            </Button>
          </form>
        </Form>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Scheduled Unavailable Dates
          </h3>
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground rounded-lg bg-accent/50">
              <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="font-semibold">No unavailable dates scheduled</p>
              <p className="text-sm">Add dates when your organization will be closed.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedDates.map((unavailableDate) => (
                <div
                  key={unavailableDate.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {formatDate(unavailableDate.date)}
                    </div>
                    {unavailableDate.reason && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {unavailableDate.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(unavailableDate.id)}
                    disabled={deletingId === unavailableDate.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === unavailableDate.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}