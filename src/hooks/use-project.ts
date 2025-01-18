"use client";

import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

export default function useProject() {
	const { data: projects } = api.project.getProjects.useQuery();
	const [activeProjectId, setActiveProjectId] = useLocalStorage(
		"active-github-ai-project",
		""
	);

	const project = projects?.find((project) => project.id === activeProjectId);

	return { projects, project, activeProjectId, setActiveProjectId };
}
