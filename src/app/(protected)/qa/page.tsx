"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { Fragment, useState } from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import { CustomMarkdownAnswer } from "@/components/custom-markdown-answer";
import CodeReferences from "../dashboard/code-references";
import { Button } from "@/components/ui/button";
import useRefetch from "@/hooks/use-refetch";
import { toast } from "sonner";

export default function QAPage() {
  const { activeProjectId } = useProject();
  const refetch = useRefetch();
  const removeSavedQuestion = api.project.removeSavedQuestion.useMutation();
  const { data: questions } = api.project.getQuestions.useQuery({
    projectId: activeProjectId,
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <div className="w-full">
      <AskQuestionCard />
      <Sheet>
        <div className="h-4"></div>
        <h1 className="text-xl font-semibold">Saved Questions</h1>
        <div className="h-2"></div>
        <div className="flex flex-col gap-2">
          {questions
            ? questions.length > 0
              ? questions.map((question, index) => {
                  return (
                    <Fragment key={question.id}>
                      <div className="flex flex-col lg:flex-row items-center justify-between lg:gap-4 bg-white rounded-lg shadow border">
                        <SheetTrigger
                          onClick={() => setQuestionIndex(index)}
                          className="p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {question.user.image ? (
                              <Image
                                src={question.user.image || "/user.png"}
                                alt="Picture of the user who asked this question"
                                width={30}
                                height={30}
                                quality={100}
                                className="size-8 rounded-full bg-gray-400"
                              />
                            ) : (
                              <div
                                className={
                                  "rounded-full flex items-center justify-center text-lg bg-primary/10 text-primary"
                                }
                              >
                                <p className="w-[2rem] h-[2rem] flex items-center justify-center">
                                  {question.user.name![0]}
                                </p>
                              </div>
                            )}

                            <div className="text-left flex flex-col w-[60vw]">
                              <div className="flex items-center gap-2">
                                <p className="text-gray-700 line-clamp-1 text-sm lg:text-base font-medium">
                                  {question.question}
                                </p>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {question.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-500 line-clamp-1 text-sm">
                                {question.answer}
                              </p>
                            </div>
                          </div>
                        </SheetTrigger>

                        <div className="mb-4 lg:mb-0 mr-0 lg:mr-4">
                          <Button
                            disabled={removeSavedQuestion.isPending}
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              removeSavedQuestion.mutate(
                                {
                                  questionId: question.id,
                                },
                                {
                                  onSuccess: async () => {
                                    await refetch();
                                    toast.success(
                                      "Question deleted successfully",
                                      {
                                        duration: 3000,
                                      }
                                    );
                                  },
                                  onError: () => {
                                    toast.error("Failed to delete question", {
                                      duration: 3000,
                                    });
                                  },
                                }
                              );
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Fragment>
                  );
                })
              : "No saved questions"
            : "Loading..."}
        </div>

        {question && (
          <SheetContent className="sm:max-w-[80vw]">
            <SheetHeader>
              <SheetTitle>{question.question}</SheetTitle>
              <MDEditor.Markdown
                source={question.answer}
                components={CustomMarkdownAnswer}
                className="!bg-white !text-gray-900 !h-full max-h-[40vh] overflow-scroll scrollbar-hidden"
              />
              <div className="h-4"></div>
              {question.fileReferences && (
                <CodeReferences
                  fileReferences={
                    Array.isArray(question.fileReferences)
                      ? question.fileReferences.filter(
                          (
                            ref
                          ): ref is {
                            fileName: string;
                            sourceCode: string;
                            summary: string;
                          } =>
                            ref !== null &&
                            typeof ref === "object" &&
                            "fileName" in ref &&
                            "sourceCode" in ref &&
                            "summary" in ref
                        )
                      : []
                  }
                />
              )}
            </SheetHeader>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
