"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type props = {
	fileReferences: {
		fileName: string;
		sourceCode: string;
		summary: string;
	}[];
};

export default function CodeReferences({ fileReferences }: props) {
	const [tab, setTab] = useState(fileReferences[0].fileName);

	return (
		<div className="max-w-[75vw]">
			<Tabs value={tab} onValueChange={setTab}>
				<div className="overflow-x-scroll flex gap-2 bg-gray-200 p-1 rounded-md">
					{fileReferences.map((file) => (
						<button
							onClick={() => setTab(file.fileName)}
							key={file.fileName}
							className={cn(
								"px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted",
								{
									"bg-primary text-primary-foreground hover:bg-primary/80":
										tab === file.fileName
								}
							)}>
							{file.fileName}
						</button>
					))}
				</div>
				{fileReferences.map((file) => (
					<TabsContent
						key={file.fileName}
						value={file.fileName}
						className="max-h-[40vh] overflow-y-auto max-w-7xl rounded-md">
						<SyntaxHighlighter
							language={file.fileName.split(".")[1]}
							style={oneDark}>
							{file.sourceCode}
						</SyntaxHighlighter>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
