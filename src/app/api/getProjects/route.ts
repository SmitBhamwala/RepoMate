import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	// const message = await request.json();
	let projects: any = [];

	const session = await auth();

	try {
		projects = await db.project.findMany({
			where: {
				userToProjects: {
					some: {
						userId: session!.user.id
					}
				}
			}
		});
	} catch (error) {
		return NextResponse.json({ error, projects });
	}

	return NextResponse.json({
		message: "Projects fetched successfully!",
		projects
	});
}
