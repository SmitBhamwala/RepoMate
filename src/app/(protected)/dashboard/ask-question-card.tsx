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
import { api } from "@/trpc/react";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./code-references";

export default function AskQuestionCard() {
	const { project, activeProjectId } = useProject();
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

	const { data: result } = api.project.getEmbeddings.useQuery({
		projectId: activeProjectId
	});

	async function OnSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setAnswer("");
		setFileReferences([]);
		if (!project?.id || !result) return;

		setLoading(true);

		const { output, fileReferences } = await askQuestion(
			question,
			project.id,
			result
		);
		setIsDialogOpen(true);
		setFileReferences(fileReferences);

		for await (const delta of readStreamableValue(output)) {
			if (delta) {
				setAnswer((ans) => ans + delta);
			}
		}

		setLoading(false);
	}

	return (
		<>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-[80vw] max-h-[100vh] overflow-scroll scrollbar-hidden">
					<DialogHeader>
						<DialogTitle>
							<Image
								src="/ai-hub.svg"
								alt="App Logo"
								width={40}
								height={40}
								quality={100}
							/>
						</DialogTitle>
					</DialogHeader>

					<MDEditor.Markdown
						source={answer}
						className="max-w-[70vw] !bg-white !text-gray-800 !h-full max-h-[40vh] overflow-scroll scrollbar-hidden"
					/>

					<div className="h-4"></div>
					<CodeReferences fileReferences={fileReferences} />
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
							onChange={(e) => setQuestion(e.target.value)}
						/>
						<div className="h-4"></div>
						<Button type="submit" disabled={loading}>
							Ask AI
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
