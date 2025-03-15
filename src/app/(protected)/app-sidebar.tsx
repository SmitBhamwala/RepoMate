"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import {
	Bot,
	Check,
	ChevronsUpDown,
	// CreditCard,
	LayoutDashboard,
	Plus,
	Presentation
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard
	},
	{
		title: "Q&A",
		url: "/qa",
		icon: Bot
	},
	{
		title: "Meetings",
		url: "/meetings",
		icon: Presentation
	},
	// {
	// 	title: "Billing",
	// 	url: "/billing",
	// 	icon: CreditCard
	// }
];

export default function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { open } = useSidebar();
	const { projects, activeProjectId, setActiveProjectId } = useProject();
	const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader>
				<Link href="/dashboard" className="flex items-center gap-2">
					<Image
						src="/ai-hub.svg"
						alt="App Logo"
						width={40}
						height={40}
						quality={100}
					/>
					{open && (
						<h1 className="text-xl font-bold text-primary/80">GitHub AI</h1>
					)}
				</Link>
			</SidebarHeader>
			<SidebarContent>
			{projects && projects.length > 0 && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Current Project</SidebarGroupLabel>
              <Popover
                open={projectDropdownOpen}
                onOpenChange={setProjectDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full",
                      open ? "justify-between" : "justify-center"
                    )}
                  >
                    {open && projects && activeProjectId
                      ? projects.find(
                          (project) => project.id === activeProjectId
                        )?.name
                      : open && "Select Project"}
                    <ChevronsUpDown
                      className={cn(
                        "h-4 w-4 shrink-0 opacity-50",
                        open && "ml-2"
                      )}
                    />
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
            </SidebarGroup>

            <div className="flex w-full justify-center items-center">OR</div>
          </>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/create">
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus />
                    {open && "Create New Project"}
                  </Button>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

				<SidebarSeparator />

				{projects && projects.length > 0 && activeProjectId && (
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn({
                            "!bg-primary !text-white": pathname === item.url,
                          })}
                        >
                          <item.icon />
                          {open && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

			</SidebarContent>
		</Sidebar>
	);
}
