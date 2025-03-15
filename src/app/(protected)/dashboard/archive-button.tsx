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
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ArchiveButton() {
  const archiveProject = api.project.archiveProject.useMutation();
  const { activeProjectId, setActiveProjectId } = useProject();
  const [isArchiveConfirmModalopen, setArchiveConfirmModalopen] =
    useState(false);

  const refetch = useRefetch();
  const router = useRouter();

  return (
    <>
      <Dialog
        open={isArchiveConfirmModalopen}
        onOpenChange={setArchiveConfirmModalopen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this project?
            </DialogTitle>
            <DialogDescription>
              Note: Project will be deleted for all team members.
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="mt-4"
              variant="outline"
              disabled={archiveProject.isPending}
              onClick={() => {
                setArchiveConfirmModalopen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="mt-4"
              variant="destructive"
              disabled={archiveProject.isPending}
              onClick={() => {
                archiveProject.mutate(
                  { projectId: activeProjectId },
                  {
                    onSuccess: () => {
                      toast.success("Project deleted successfully", {
                        duration: 3000,
                      });
                      refetch();
                      setActiveProjectId("");
                      setArchiveConfirmModalopen(false);
                      router.push("/create");
                    },
                    onError: () => {
                      toast.error("Failed to delete project", {
                        duration: 3000,
                      });
                    },
                  }
                );
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        disabled={archiveProject.isPending}
        size="sm"
        variant="destructive"
        onClick={() => setArchiveConfirmModalopen(true)}
      >
        Delete
      </Button>
    </>
  );
}
