"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import useProject from "@/hooks/use-project";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  Loader,
  Plus,
  Presentation,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Create",
    url: "/create",
    icon: Plus,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
];
export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { projects, activeProjectId, setActiveProjectId } = useProject();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="hidden lg:flex">
          <AppSidebar />
        </div>
        <main className="w-full p-2 flex flex-col items-center">
          <div className="sticky w-full flex items-center justify-between gap-6 lg:gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
            <SidebarTrigger className="w-10 h-10 hidden lg:flex" />
            <Link
              href="/dashboard"
              className="flex lg:hidden flex-shrink-0 items-center"
            >
              <Image
                src="/ai-hub.svg"
                alt="App Logo"
                width={40}
                height={40}
                quality={100}
              />
            </Link>
            <Popover
              open={projectDropdownOpen}
              onOpenChange={setProjectDropdownOpen}
            >
              <PopoverTrigger asChild className="flex lg:hidden">
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full max-w-[50vw] gap-2 justify-between"
                >
                  <div className="flex items-center overflow-hidden truncate">
                    {!projects ? (
											<Loader className="text-primary animate-spin" />
										) : projects.some(
												(project) => project.id === activeProjectId
										  ) ? (
											projects.find((project) => project.id === activeProjectId)
												?.name
										) : (
											"Select Project"
										)}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search project" />
                  <CommandList>
                    <CommandEmpty>No projects found!</CommandEmpty>
                    <CommandGroup>
                      {projects?.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={project.id}
                          className={cn(
                            "cursor-pointer shadow-none",
                            activeProjectId === project.id &&
                              "bg-primary/10 hover:bg-primary/10"
                          )}
                          onSelect={(currentValue) => {
                            setActiveProjectId(currentValue);
                            router.push("/dashboard");
                            setProjectDropdownOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              activeProjectId === project.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div
                            className={cn(
                              "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                              {
                                "bg-primary text-white":
                                  project.id === activeProjectId,
                              }
                            )}
                          >
                            {project.name[0]}
                          </div>
                          <span>{project.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarImage src={session?.user.image || "user.png"} />
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
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Logout
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="h-4"></div>

          <div className="w-full border-sidebar-border bg-sidebar border shadow rounded-md overflow-x-hidden overflow-y-scroll h-[calc(100dvh-10rem)] lg:h-[calc(100vh-6rem)] p-4">
            {children}
          </div>

          <div className="h-4 block lg:hidden"></div>

          <div className="fixed w-full max-w-80 md:max-w-96 bottom-1 flex lg:hidden items-center justify-between gap-6 lg:gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2">
            {navigationItems.map((item) => {
              return (
                <Link
                  href={item.url}
                  key={item.title}
                  className={cn(
                    "p-2 rounded-md cursor-pointer",
                    pathname === item.url && "!bg-primary !text-white"
                  )}
                >
                  <item.icon />
                </Link>
              );
            })}
          </div>
        </main>
      </SidebarProvider>
    </SessionProvider>
  );
}
