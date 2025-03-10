"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import useRefetch from "@/hooks/use-refetch";

export default function MeetingCard() {
  const { project } = useProject();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingURL: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingURL, meetingId, projectId } = data;
      const response = await fetch("/api/process-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingURL, meetingId, projectId }),
      });

      const jsonData = await response.json();
      return jsonData.data;
    },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const refetch = useRefetch();
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      if (!project) {
        return;
      }
      setIsUploading(true);
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }
      const downloadURL = (await uploadFile(file, setProgress)) as string;
      uploadMeeting.mutate(
        {
          projectId: project.id,
          meetingURL: downloadURL,
          name: file.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully");
            router.push("/meetings");
            processMeeting.mutateAsync({
              meetingURL: downloadURL,
              meetingId: meeting.id,
              projectId: project.id,
            });
            refetch();
          },
          onError: () => {
            toast.error("Failed to upload meeting");
          },
        }
      );

      setIsUploading(false);
    },
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-10">
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting
            <br />
            Powered by AI
          </p>
          <div className="mt-6">
            <Button disabled={isUploading} {...getRootProps()}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div className="flex items-center justify-center flex-col">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              pathColor: "#2563eb",
              textColor: "#2563eb",
            })}
          />
          <p className="text-sm text-gray-500 text-center">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
}
