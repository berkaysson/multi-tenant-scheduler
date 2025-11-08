"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { cancelAppointment } from "@/actions/cancel-appointment";
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
import { Loader2 } from "lucide-react";

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
        setCancellationReason("");
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">Appointment:</p>
            <p className="text-sm text-gray-600">{appointmentTitle}</p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="cancellation-reason"
              className="text-sm font-medium"
            >
              Cancellation Notes (Optional)
            </label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please provide a reason for cancellation (optional)"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              You can provide a reason for cancellation to help the organization.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCancellationReason("");
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

