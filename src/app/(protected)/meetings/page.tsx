"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

export default function MeetingsPage() {
  const { activeProjectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    {
      projectId: activeProjectId,
    },
    { refetchInterval: 4000 }
  );
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const refetch = useRefetch();
  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && (
        <p className="text-gray-500">No meetings found</p>
      )}
      {isLoading && <p className="text-gray-500">Loading...</p>}
      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex flex-col lg:flex-row lg:items-center justify-between py-5 gap-y-2 lg:gap-y-0 gap-x-6"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-x-2">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toLocaleDateString()}
                </p>
                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>

            <div className="flex items-center flex-none gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button size="sm" variant="outline">
                  View Meeting
                </Button>
              </Link>
              <Button
                size="sm"
                disabled={deleteMeeting.isPending}
                variant="destructive"
                onClick={() =>
                  deleteMeeting.mutate(
                    { meetingId: meeting.id },
                    {
                      onSuccess: () => {
                        toast.success("Meeting deleted successfully", {
                          duration: 3000,
                        });
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to delete meeting", {
                          duration: 3000,
                        });
                      },
                    }
                  )
                }
              >
                Delete Meeting
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
