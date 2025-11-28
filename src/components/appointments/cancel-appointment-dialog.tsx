"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { cancelAppointment } from "@/actions/appointment/cancel-appointment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CancelAppointmentDialogProps {
  appointmentId: string;
  appointmentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelAppointmentDialog({
  appointmentId,
  appointmentTitle,
  open,
  onOpenChange,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelAppointment(
        appointmentId,
        cancellationReason || undefined
      );

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
      setCancellationReason("");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setCancellationReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm you want to cancel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border bg-muted/50 p-3">
            <p className="text-sm font-medium text-muted-foreground">
              You are about to cancel:
            </p>
            <p className="font-semibold text-foreground">{appointmentTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">
              Cancellation Notes (Optional)
            </Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Provide a reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
