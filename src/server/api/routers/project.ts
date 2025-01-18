import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
	})
});
