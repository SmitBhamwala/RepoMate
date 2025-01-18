"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
	repoURL: string;
	projectName: string;
	githubToken?: string;
};

export default function CreatePage() {
	const { data: session } = useSession();
	const [isPending, startTranition] = useTransition();

	const { register, handleSubmit, reset } = useForm<FormInput>();

	async function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function onSubmit(data: FormInput) {
		toast.loading("Creating project...");
		startTranition(async () => {
			const response = await fetch("http://localhost:3000/api/createProject", {
				method: "POST",
				body: JSON.stringify({
					data: {
						gitHubURL: data.repoURL,
						name: data.projectName,
						userId: session?.user.id
					}
				}),
				headers: {
					"Content-Type": "application/json"
				}
			});
			const message = await response.json();
			toast.dismiss();

			if (message.error) {
				toast.error(message.error, { duration: 2000 });
			} else {
				toast.success(message.message, { duration: 2000 });
				reset();
			}
		});
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
						<Button disabled={isPending} type="submit">
							Create Project
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
