import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div>
      {/* {JSON.stringify(session)} */}
      <div className="m-4">
        <p>ID: {session?.user.id}</p>
        <p>Name: {session?.user.name}</p>
        <p>Email: {session?.user.email}</p>
        <p>Image: {session?.user.image}</p>
        <p>Role: {session?.user.role}</p>

      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
}
