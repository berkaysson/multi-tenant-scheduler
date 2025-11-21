"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, QrCodeIcon, ExternalLink } from "lucide-react";
import QRCode from "react-qr-code";
import Link from "next/link";

interface OrganizationShareDialogProps {
  organizationName: string;
  organizationSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationShareDialog({
  organizationName,
  organizationSlug,
  open,
  onOpenChange,
}: OrganizationShareDialogProps) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const publicUrl = useMemo(() => {
    if (!origin) return "";
    return `${origin}/o/${organizationSlug}`;
  }, [origin, organizationSlug]);

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5" />
            Share Organization
          </DialogTitle>
          <DialogDescription>
            Share the public booking link for <span className="font-semibold text-foreground">{organizationName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {publicUrl ? (
              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <QRCode value={publicUrl} size={180} />
              </div>
            ) : (
              <div className="h-[212px] w-[212px] rounded-xl bg-muted animate-pulse" />
            )}
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to open the public booking page.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Public link</label>
            <div className="flex gap-2">
              <Input value={publicUrl || "Loading..."} readOnly />
              <Button type="button" variant="outline" onClick={handleCopy} disabled={!publicUrl}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {publicUrl && (
            <div className="flex justify-end">
              <Button asChild variant="default">
                <Link href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open public page
                </Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

