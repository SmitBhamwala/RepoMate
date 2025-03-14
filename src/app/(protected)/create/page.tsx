"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
	repoURL: string;
	projectName: string;
	githubToken?: string;
};

export default function CreatePage() {
	const { register, handleSubmit, reset } = useForm<FormInput>();
	const createProject = api.project.createProject.useMutation();
	const refetch = useRefetch();
	const router = useRouter();
	const { setActiveProjectId } = useProject();

	function onSubmit(data: FormInput) {
		toast.loading("Creating project");
		createProject.mutate(
			{
				name: data.projectName,
				gitHubURL: data.repoURL,
				gitHubToken: data.githubToken
			},
			{
				onSuccess: (project) => {
					toast.dismiss();
					toast.success("Project created successfully", { duration: 3000 });
					refetch();
					reset();
					setActiveProjectId(project.id);
					router.push("/dashboard");
				},
				onError: () => {
					toast.dismiss();
					toast.error("Error creating project", { duration: 3000 });
				}
			}
		);
		return true;
	}

	return (
		<div className="flex items-center justify-center gap-12 h-full">
			<Image
				src="/undraw_developer-activity_blue.svg"
				className="h-56 w-auto"
				alt=""
				width={100}
				height={100}
				quality={100}
			/>
			<div>
				<div>
					<h1 className="font-semibold text-2xl">
						Link your GitHub Repository
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter the details of your repository to link it
					</p>
				</div>
				<div className="h-4"></div>
				<div>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Input
							{...register("projectName", { required: true })}
							placeholder="Project Name"
							required
						/>
						<div className="h-2"></div>
						<Input
							{...register("repoURL", { required: true })}
							placeholder="GitHub URL"
							type="url"
							required
						/>
						<div className="h-2"></div>
						<Input
							{...register("githubToken")}
							placeholder="GitHub Token (Optional)"
						/>
						<div className="h-4"></div>
						<Button type="submit" disabled={createProject.isPending}>
							Create Project
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
