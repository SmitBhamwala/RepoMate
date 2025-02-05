"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CustomMarkdownAnswer } from "@/components/custom-markdown-answer";
import useRefetch from "@/hooks/use-refetch";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AskQuestionCard() {
	const { project } = useProject();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const [fileReferences, setFileReferences] = useState<
		{
			fileName: string;
			sourceCode: string;
			summary: string;
		}[]
	>([]);
	const [answer, setAnswer] = useState("");

	const saveAnswer = api.project.saveAnswer.useMutation();
	const refetch = useRefetch();

	async function OnSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setAnswer("");
		setFileReferences([]);
		if (!project?.id) return;

		setLoading(true);

		try {
			const { output, fileReferences } = await askQuestion(
				question.trimEnd(),
				project.id
			);
			setIsDialogOpen(true);
			setFileReferences(fileReferences);

			for await (const delta of readStreamableValue(output)) {
				if (delta) {
					setAnswer((ans) => ans + delta);
				}
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}

		setLoading(false);
	}

	return (
		<>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-[80vw] max-h-[100vh] overflow-scroll scrollbar-hidden">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<DialogTitle>
								<Image
									src="/ai-hub.svg"
									alt="App Logo"
									width={40}
									height={40}
									quality={100}
								/>
							</DialogTitle>
							{loading ? (
								<Loader className="text-primary animate-spin" />
							) : (
								<Button
									variant="outline"
									disabled={saveAnswer.isPending || saveAnswer.isSuccess}
									onClick={() => {
										saveAnswer.mutate(
											{
												question,
												answer,
												projectId: project!.id,
												fileReferences
											},
											{
												onSuccess: () => {
													toast.success("Answer saved!");
													refetch();
												},
												onError: () => {
													toast.error("Failed to save answer!");
												}
											}
										);
									}}>
									{saveAnswer.isSuccess ? "Saved" : "Save Answer"}
								</Button>
							)}
						</div>
					</DialogHeader>
					{answer ? (
						<MDEditor.Markdown
							source={answer}
							components={CustomMarkdownAnswer}
							className="max-w-[70vw] !bg-white !text-gray-900 !h-full max-h-[40vh] overflow-scroll scrollbar-hidden"
						/>
					) : (
						<p className="flex justify-center items-center">Thinking...</p>
					)}

					<div className="h-4"></div>
					{fileReferences && <CodeReferences fileReferences={fileReferences} />}
					<Button type="button" onClick={() => setIsDialogOpen(false)}>
						Close
					</Button>
				</DialogContent>
			</Dialog>

			<Card className="relative col-span-3">
				<CardHeader>
					<CardTitle>Ask a question</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={(e: FormEvent<HTMLFormElement>) => OnSubmit(e)}>
						<Textarea
							placeholder="Which file should I edit to change the home page?"
							value={question}
							required
							onChange={(e) => setQuestion(e.target.value.trimStart())}
						/>
						<div className="h-4"></div>
						<div className={cn(loading ? "!cursor-not-allowed" : "", "w-fit")}>
							<Button type="submit" disabled={loading}>
								Ask AI
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
