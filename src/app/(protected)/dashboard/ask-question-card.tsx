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

export default function AskQuestionCard() {
	const { project } = useProject();
	const [isDialogOpen, setDialogonOpen] = useState(false);
	const [question, setQuestion] = useState("");

	function OnSubmit(e: FormEvent) {
		e.preventDefault();
		setDialogonOpen(true);
	}

	return (
		<>
			<Dialog open={isDialogOpen} onOpenChange={setDialogonOpen}>
				<DialogContent>
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
				</DialogContent>
			</Dialog>

			<Card className="relative col-span-3">
				<CardHeader>
					<CardTitle>Ask a question</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={(e: FormEvent) => OnSubmit(e)}>
						<Textarea
							placeholder="Which file should I edit to change the home page?"
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
						/>
						<div className="h-4"></div>
						<Button type="submit">Ask AI</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
