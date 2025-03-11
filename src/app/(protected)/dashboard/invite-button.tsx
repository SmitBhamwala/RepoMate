"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import { useState } from "react";
import { toast } from "sonner";

export default function InviteButton() {
  const { activeProjectId } = useProject();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>
          <Input
            className="mt-2 cursor-pointer"
            readOnly
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/join/${activeProjectId}`
              );
              toast.success("Copied to clipboard", { duration: 2000 });
            }}
            value={`${window.location.origin}/join/${activeProjectId}`}
          />
        </DialogContent>
      </Dialog>
      <Button size="sm" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
}
