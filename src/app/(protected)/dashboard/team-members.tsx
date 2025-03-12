"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import Image from "next/image";

export default function TeamMembers() {
  const { activeProjectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({
    projectId: activeProjectId,
  });

  return (
    <div className="flex items-center gap-2">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center gap-2">
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger>
              <Image
                src={member.user.image || "/user.png"}
                alt={member.user.name || "User"}
                height={30}
                width={30}
                className="rounded-full cursor-pointer"
              />
            </HoverCardTrigger>
            <HoverCardContent side="top" className="flex items-center justify-center w-fit">
              <p className="text-sm">{member.user.name || "User"}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      ))}
    </div>
  );
}
