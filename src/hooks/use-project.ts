"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function useProject() {
	const [projects, setProjects] = useState([]);
	const [activeProject, setActiveProject] = useState([]);
	const [activeProjectId, setActiveProjectId] = useLocalStorage(
		"active-github-ai-project",
		""
	);


	useEffect(() => {
		async function getProjects() {
			try {
				const response = await fetch("http://localhost:3000/api/getProjects", {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				});
				const message = await response.json();
				console.log(message.projects);

				setProjects(message.projects);
			} catch (error: any) {
				console.log(error);
			}
		}

		getProjects();
	}, []);
	return { projects };
}
