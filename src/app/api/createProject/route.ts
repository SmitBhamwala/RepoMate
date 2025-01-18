import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const message = await request.json();

	try {
		await db.project.create({
      data: {
        gitHubURL: message.data.gitHubURL,
        name: message.data.name,
        userToProjects: {
          create: {
            userId: message.data.userId
          }
        }
      }
    });
	} catch (error) {
		return NextResponse.json({ error });
	}

	return NextResponse.json({ message: "Project created successfully!" });
}
