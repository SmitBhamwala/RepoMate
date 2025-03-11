"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ArchiveButton() {
  const archiveProject = api.project.archiveProject.useMutation();
  const { activeProjectId } = useProject();
  const refetch = useRefetch();
  const router = useRouter();

  return (
    <Button
      disabled={archiveProject.isPending}
      size="sm"
      variant="destructive"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?"
        );
        if (confirm) {
          archiveProject.mutate(
            { projectId: activeProjectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully", {
                  duration: 2000,
                });
                refetch();
                router.push("/create");
              },
              onError: () => {
                toast.error("Failed to archive project", { duration: 2000 });
              },
            }
          );
        }
      }}
    >
      Archive
    </Button>
  );
}
