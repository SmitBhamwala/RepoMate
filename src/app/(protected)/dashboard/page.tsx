"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
	const { data: session } = useSession();

	return (
		<div>
			<div className="m-4">
				<p>ID: {session?.user.id}</p>
				<p>Name: {session?.user.name}</p>
				<p>Email: {session?.user.email}</p>
				<p>Image: {session?.user.image}</p>
				<p>Role: {session?.user.role}</p>
			</div>
			<Button type="submit" onClick={() => signOut()}>
				Logout
			</Button>
		</div>
	);
}
