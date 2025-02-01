import { Children, HTMLAttributes, isValidElement, ReactNode } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

import "./custom-markdown-answer.css";

export const CustomMarkdownAnswer = {
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
