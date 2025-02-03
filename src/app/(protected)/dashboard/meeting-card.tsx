"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function MeetingCard() {
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			audio: [".mp3", ".wav", ".m4a"]
		},
		multiple: false,
		maxSize: 50 * 1024 * 1024,
		onDrop: async (acceptedFiles) => {
			setIsUploading(true);
			console.log(acceptedFiles);
			const file = acceptedFiles[0];
			const downloadURL = await uploadFile(file, setProgress);
			console.log(downloadURL);

			setIsUploading(false);
		}
	});
	console.log(progress);

	return (
		<Card
			className="col-span-2 flex flex-col items-center justify-center p-10"
			{...getRootProps()}>
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
						<Button disabled={isUploading}>
							<Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden />
							Upload Meeting
							<input className="hidden" {...getInputProps()} />
						</Button>
					</div>
				</>
			)}
		</Card>
	);
}
