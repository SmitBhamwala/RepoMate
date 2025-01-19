"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SidebarLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const { data: session } = useSession();

	return (
		<SessionProvider>
			<SidebarProvider>
				<AppSidebar />
				<main className="w-full m-2">
					<div className="flex items-center justify-end gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
						{/* <SearchBar /> */}
						<p>{session?.user.name}</p>
						<Button type="submit" onClick={() => signOut()}>
							Logout
						</Button>
						{/* <div className="ml-auto"></div> */}
						{/* <UserButton /> */}
					</div>
					<div className="h-4"></div>
					{/* main content */}
					<div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
						{children}
					</div>
				</main>
			</SidebarProvider>
		</SessionProvider>
	);
}
