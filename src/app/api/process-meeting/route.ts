import { auth } from "@/auth";
import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  meetingURL: z.string(),
  projectId: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 60; // 1 minute

export async function POST(req: NextRequest) {
  const user = await auth();

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  try {
    const body = await req.json();
    const { meetingURL, meetingId } = bodyParser.parse(body);
    const { summaries } = await processMeeting(meetingURL);
    await db.issues.createMany({
      data: summaries.map((summary) => ({
        start: summary.start,
        end: summary.end,
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
        meetingId,
      })),
    });

    await db.meetings.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: summaries[0]!.headline,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
