"use client";

import IssuesListPage from "./issues-list";
import { useParams } from "next/navigation";

export default function MeetingDetailsPage() {
  const params = useParams<{ meetingId: string }>();
  const { meetingId } = params;
  return (
    <div>
      <IssuesListPage meetingId={meetingId} />
    </div>
  );
}
