"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateAiTextToVectorEmbedding } from "@/lib/gemini";
import { db } from "@/lib/db";

const google = createGoogleGenerativeAI({
	apiKey: process.env.GEMINI_API_KEY_3
});

export async function askQuestion(question: string, projectId: string) {
	const stream = createStreamableValue();

	const queryVector = await generateAiTextToVectorEmbedding(question);

	// const result = (await db.$queryRaw`
	// SELECT "filename", "sourceCode", "summary", 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) as similarity
	// FROM "sourceCodeEmbeddings"
	// WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
	// AND "projectId" = ${projectId}
	// ORDER BY similarity DESC
	// LIMIT 10`) as { fileName: string; sourceCode: string; summary: string }[];

	const rawResult = (await db.$runCommandRaw({
		aggregate: "sourceCodeEmbeddings",
		pipeline: [
			{
				$addFields: {
					similarity: {
						$subtract: [
							1,
							{
								$let: {
									vars: {
										dotProduct: {
											$sum: {
												$map: {
													input: {
														$range: [0, { $size: "$summaryEmbedding" }]
													},
													as: "index",
													in: {
														$multiply: [
															{
																$arrayElemAt: ["$summaryEmbedding", "$$index"]
															},
															{ $arrayElemAt: [queryVector, "$$index"] }
														]
													}
												}
											}
										},
										magnitudeA: {
											$sqrt: {
												$sum: {
													$map: {
														input: "$summaryEmbedding",
														as: "value",
														in: { $pow: ["$$value", 2] }
													}
												}
											}
										},
										magnitudeB: {
											$sqrt: {
												$sum: {
													$map: {
														input: queryVector,
														as: "value",
														in: { $pow: ["$$value", 2] }
													}
												}
											}
										}
									},
									in: {
										$divide: [
											"$$dotProduct",
											{ $multiply: ["$$magnitudeA", "$$magnitudeB"] }
										]
									}
								}
							}
						]
					}
				}
			},
			{
				$match: {
					similarity: { $gt: 0.4 },
					projectId: { $oid: projectId }
				}
			},
			{
				$sort: { similarity: 1 }
			},
			{
				$limit: 10
			},
			{
				$project: {
					fileName: 1,
					sourceCode: 1,
					summary: 1,
					similarity: 1,
          summaryEmbedding: 1
				}
			}
		],
		cursor: {}
	})) as unknown as {
		cursor: {
			firstBatch: { fileName: string; sourceCode: string; summary: string; summaryEmbedding:unknown }[];
		};
		ok: number;
	};

	const result = rawResult.cursor.firstBatch;
  console.log(result);
  

	let context = "";

	for (const doc of result) {
		context += `fileName: ${doc.fileName},\nsourceCode: ${doc.sourceCode},\nsummary: ${doc.summary}\n\n`;
	}

	(async () => {
		const { textStream } = await streamText({
			model: google("gemini-1.5-flash"),
			prompt: `
      You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern.
      AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the codebase.
      If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions.
      
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      
      START QUESTION
      ${question}
      END OF QUESTION

      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question.".
      AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      Answer in markdown syntax, with code snippets if needed. Be as detailed as possibled when answering.
      Answer should be relevant to the question.
      Sometimes question can be explain <File name> file. You should check whether any similar name file is present in the context.
      Example question: Explain styles.css file.
      Example answer should be to find similar name file and explain the contents of that file. Don't widen the search to other irrelevant files.
      The relevant file should have a higher similarity.
      `
		});

		for await (const delta of textStream) {
			stream.update(delta);
		}

		stream.done();
	})();

	return {
		output: stream.value,
		fileReferences: result
	};
}
