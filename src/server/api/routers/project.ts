import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGitHubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				gitHubURL: z.string(),
				gitHubToken: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const project = await ctx.db.project.create({
				data: {
					name: input.name,
					gitHubURL: input.gitHubURL,
					userToProjects: {
						create: {
							userId: ctx.user.user.id
						}
					}
				}
			});
			await indexGitHubRepo(project.id, input.gitHubURL, input.gitHubToken);
			await pollCommits(project.id);
			return project;
		}),
	getProjects: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.project.findMany({
			where: {
				userToProjects: {
					some: {
						userId: ctx.user.user.id
					}
				}
			}
		});
	}),
	getCommits: protectedProcedure
		.input(
			z.object({
				projectId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			// pollCommits(input.projectId).then().catch(console.error);
			return await ctx.db.commits.findMany({
				where: {
					projectId: input.projectId
				}
			});
		})
});
