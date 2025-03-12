"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
            <DialogDescription>
              <p className="mt-4 text-sm italic text-gray-500">
                Note: Anyone with this link will be able to join this project.
              </p>
            </DialogDescription>
            <DialogDescription>
              <p className="text-sm text-gray-500">
                Click on the link below to copy
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Input
              className="cursor-pointer focus-visible:ring-transparent"
              readOnly
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${activeProjectId}`
                  );
                  toast.success("Copied to clipboard", { duration: 2000 });
                }
              }}
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/join/${activeProjectId}`
                  : ""
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
}
