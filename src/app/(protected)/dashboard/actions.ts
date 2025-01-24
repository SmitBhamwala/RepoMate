"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAi } from "@ai-sdk/google";

const google = createGoogleGenerativeAi({
	apiKey: process.env.GEMINI_API_KEY_3
});

export async function askQuestion(question: string, projectId: string) {
	const stream = createStreamableValue();
}
