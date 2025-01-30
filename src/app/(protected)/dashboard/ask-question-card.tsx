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
import { Children, FormEvent, isValidElement, useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./code-references";
import "./ask-question-card.css";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

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

	async function OnSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setAnswer("");
		setFileReferences([]);
		if (!project?.id) return;

		setLoading(true);

		const { output, fileReferences } = await askQuestion(question, project.id);
		setIsDialogOpen(true);
		setFileReferences(fileReferences);

		for await (const delta of readStreamableValue(output)) {
			if (delta) {
				setAnswer((ans) => ans + delta);
			}
		}

		setLoading(false);
	}

	const components = {
		code: (props: React.HTMLAttributes<HTMLElement>) => {
			const { children, className } = props;

			const codeString =
				Children.map(children, (child) => {
					if (
						isValidElement(child) &&
						child.props &&
						typeof child.props === "object" &&
						"children" in child.props
					) {
						const childProps = child.props as { children?: React.ReactNode }; // Type assertion
						return typeof childProps.children === "string"
							? childProps.children
							: "";
					}
					return typeof child === "string" ? child : "";
				})?.join("") ?? "";

			// Handle inline code (e.g., `code`)
			if (!className) {
				return <code className="inline-code">{codeString}</code>;
			}

			// Extract the language from the className (e.g., "language-javascript")
			const match = /language-(\w+)/.exec(className || "");
			const language = match ? match[1] : "plaintext";

			// Render the code block with syntax highlighting
			return (
				<div>
					{Children.map(children, (child, index) => {
						if (
							isValidElement(child) &&
							child.props &&
							typeof child.props === "object" &&
							"children" in child.props
						) {
							const childProps = child.props as { children?: React.ReactNode };
							const codeContent =
								typeof childProps.children === "string"
									? childProps.children
									: "";
							return (
								<SyntaxHighlighter
									key={index} // Ensure each line gets a unique key
									language={language}
									style={atomOneDark}
									PreTag="div"
									customStyle={{ whiteSpace: "pre-wrap" }}>
									{codeContent.trim()}
								</SyntaxHighlighter>
							);
						}

						// If the child is just text, handle it directly
						return typeof child === "string" ? (
							<SyntaxHighlighter
								key={index}
								language={language}
								style={atomOneDark}
								PreTag="div"
								customStyle={{ whiteSpace: "pre-wrap" }}>
								{child.trim()}
							</SyntaxHighlighter>
						) : null;
					})}
				</div>
			);
		}
	};

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

					<div className="markdown-wrapper">
						<MDEditor.Markdown
							source={answer}
							components={components}
							className="max-w-[70vw] !bg-white !text-gray-900 !h-full max-h-[40vh] overflow-scroll scrollbar-hidden"
						/>
					</div>

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
