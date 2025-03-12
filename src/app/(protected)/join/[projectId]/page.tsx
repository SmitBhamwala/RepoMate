import { auth } from "@/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string }>;
};
export default async function JoinHandler(props: Props) {
  const { projectId } = await props.params;
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    return redirect("/dashboard");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return redirect("/dashboard");
  }

  try {
    await db.userToProject.create({
      data: {
        userId: dbUser.id,
        projectId: project.id,
      },
    });
  } catch (error) {
    console.log("User already in project");
    console.log(error);
  }

  return redirect("/dashboard");
}
