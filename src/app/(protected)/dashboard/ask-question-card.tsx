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
import {
	Children,
	FormEvent,
	HTMLAttributes,
	isValidElement,
	ReactNode,
	useState
} from "react";
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
		code: (props: HTMLAttributes<HTMLElement>) => {
			const { children, className } = props;

			const match = /language-(\w+)/.exec(className || "");
			const language = match ? match[1] : "plaintext";

			if (!className) {
				return <code className="inline-code">{children}</code>;
			}

			const codeString = Children.toArray(children)
				.map((child) => {
					if (typeof child === "string") {
						return child.trimEnd();
					}
					if (
						isValidElement<{ children?: ReactNode }>(child) &&
						typeof child.props.children === "string"
					) {
						return child.props.children.trimEnd();
					}
					return "";
				})
				.join("\n");

			return (
				<SyntaxHighlighter
					language={language}
					style={atomOneDark}
					// showLineNumbers
					PreTag="div"
					customStyle={{
						fontSize: "1em",
						lineHeight: "1.6",
						whiteSpace: "pre",
						padding: "1rem",
						borderRadius: "7px",
						overflowX: "auto"
					}}>
					{codeString}
				</SyntaxHighlighter>
			);
		},

		ul: ({ children }: HTMLAttributes<HTMLElement>) => (
			<ul className="custom-ul">{children}</ul>
		),
		ol: ({ children }: HTMLAttributes<HTMLElement>) => (
			<ol className="custom-ol">{children}</ol>
		),
		li: ({ children }: HTMLAttributes<HTMLElement>) => (
			<li className="custom-li">{children}</li>
		)
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
