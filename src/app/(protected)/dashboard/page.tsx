"use client";

import useProject from "@/hooks/use-project";
import { Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

export default function DashboardPage() {
  const { project } = useProject();

  return (
    <>
      {project ? (
        <div>
          <div className="flex items-center justify-end md:justify-between flex-wrap gap-y-4">
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-white w-fit rounded-md bg-primary px-4 py-3">
              <Github className="size-5 flex-shrink-0" />
              <span>This project is linked to: </span>
              <Link
                href={project?.gitHubURL ?? ""}
                target="_blank"
                className="hover:underline"
              >
                {project?.gitHubURL.split("//").pop()}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <TeamMembers />
              <InviteButton />
              <ArchiveButton />
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
              <AskQuestionCard />
              <MeetingCard />
            </div>
          </div>
          <div className="mt-8 mb-3 text-xl font-semibold text-gray-700">Commit Summary</div>
          {project && <CommitLog />}
        </div>
      ) : (
        <div className="text-sm md:text-lg flex items-center justify-center">
          Select a project or create a new project
        </div>
      )}
    </>
  );
}
