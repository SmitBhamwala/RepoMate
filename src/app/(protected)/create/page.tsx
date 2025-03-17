"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
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
	const checkCredits = api.project.checkCredits.useMutation();

	const refetch = useRefetch();
	const router = useRouter();
	const { setActiveProjectId } = useProject();

	function onSubmit(data: FormInput) {
		if (!!checkCredits.data) {
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
						checkCredits.reset();
						setActiveProjectId(project.id);
						router.push("/dashboard");
					},
					onError: () => {
						toast.dismiss();
						toast.error("Error creating project", { duration: 3000 });
					}
				}
			);
		} else {
			toast.loading("Checking credits");
			checkCredits.mutate(
				{
					gitHubUrl: data.repoURL,
					gitHubToken: data.githubToken
				},
				{
					onSuccess: () => {
						toast.dismiss();
					},
					onError: () => {
						toast.dismiss();
						toast.error("Error checking credits", { duration: 3000 });
					}
				}
			);
		}
		return true;
	}

	return (
		<div className="flex flex-col lg:flex-row items-center justify-center gap-12 h-full">
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
						{!!checkCredits.data && (
							<>
								<div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
									<div className="flex items-center gap-2">
										<Info className="size-4" />
										<p className="text-sm">
											You will be charged{" "}
											<strong>{checkCredits.data.fileCount}</strong> credits for
											this repository
										</p>
									</div>
									<p className="text-sm text-blue-600 ml-6">
										You have <strong>{checkCredits.data.userCredits}</strong>{" "}
										credits remaining.
									</p>
								</div>
							</>
						)}
						<div className="h-4"></div>
						<Button
							type="submit"
							disabled={createProject.isPending || checkCredits.isPending}>
							{!!checkCredits.data ? "Create Project" : "Check Credits"}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
