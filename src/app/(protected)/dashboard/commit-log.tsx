"use client";

import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CommitLog() {
	const { project, activeProjectId } = useProject();

	const { data: commits } = api.project.getCommits.useQuery({
		projectId: activeProjectId
	});

	return (
		<>
			<ul className="space-y-6">
				{commits?.map((commit, commitIdx) => {
					return (
						<li key={commit.id} className="relative flex gap-x-4">
							<div
								className={cn(
									commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
									"absolute left-0 top-0 flex justify-center w-6"
								)}>
								<div className="w-px translate-x-1 bg-gray-200"></div>
							</div>
							<>
								<Image
									src={commit.commitAuthorAvatar}
									alt="Commit avatar"
									width={100}
									height={100}
									quality={100}
									className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
								/>
								<div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
									<div className="flex justify-between gap-x-4">
										<Link
											target="_blank"
											href={`${project?.gitHubURL}/commit/${commit.commitHash}`}
											className="py-0.5 text-xs leading-5 text-gray-500">
											<span className="font-medium text-gray-900">
												{commit.commitAuthorName}
											</span>{" "}
											<span className="inline-flex items-center">
												commited
												<ExternalLink className="ml-1 size-4" />
											</span>
										</Link>
									</div>
									<div className="flex gap-1 items-center">
                    <span className="font-semibold">
                      {commit.commitMessage}
                    </span>
                    <span className="hidden md:block font-normal text-xs text-gray-500">
                      (
                      {commit.commitDate.getDate() +
                        "/" +
                        commit.commitDate.getMonth() +
                        "/" +
                        commit.commitDate.getFullYear()}
                      )
                    </span>
                  </div>
									<pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
										{commit.summary}
									</pre>
								</div>
							</>
						</li>
					);
				})}
			</ul>
		</>
	);
}
