import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}: ${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export async function processMeeting(meetingURL: string) {
  const transript = await client.transcripts.transcribe({
    audio: meetingURL,
    auto_chapters: true,
  });

  const summaries =
    transript.chapters?.map((chapter) => ({
      start: msToTime(chapter.start),
      end: msToTime(chapter.end),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary,
    })) || []

  if (!transript.text) {
    throw new Error("No transcript found!!");
  }

  return {
    summaries,
  };
}
