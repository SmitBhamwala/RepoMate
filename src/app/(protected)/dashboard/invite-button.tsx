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
import useProject from "@/hooks/use-project";
import { LinkIcon } from "lucide-react";
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
            <DialogTitle className="text-xl">Invite Team Members</DialogTitle>
            <DialogDescription className="!mt-4 text-sm italic text-gray-500">
              Note: Anyone with this link will be able to join this project.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex !justify-start items-center">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${activeProjectId}`
                  );
                  toast.success("Copied to clipboard", { duration: 3000 });
                }
              }}
            >
              <LinkIcon />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
}
