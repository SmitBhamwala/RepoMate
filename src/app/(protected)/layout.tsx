"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

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
            <SidebarTrigger />

            <div className="ml-auto"></div>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarImage
                    src={
                      session?.user.image ||
                      "user.png"
                    }
                  />
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="flex justify-center items-center">
                  {session?.user.name}
                </DropdownMenuLabel>
                <DropdownMenuItem>
                  <Button
                    className="w-full"
                    type="submit"
                    onClick={() => signOut()}
                  >
                    Logout
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
