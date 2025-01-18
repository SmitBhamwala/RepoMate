"use client";

import { Button } from "@/components/ui/button";
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
	useSidebar
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import {
	Bot,
	CreditCard,
	LayoutDashboard,
	Plus,
	Presentation
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
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
	{
		title: "Billing",
		url: "/billing",
		icon: CreditCard
	}
];

export default function AppSidebar() {
	const pathname = usePathname();
	const { open } = useSidebar();
	const { projects, activeProjectId, setActiveProjectId } = useProject();

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<Image
						src="/ai-hub.svg"
						alt="logo"
						width={40}
						height={40}
						quality={100}
					/>
					{open && (
						<h1 className="text-xl font-bold text-primary/80">GitHub AI</h1>
					)}
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<Link
												href={item.url}
												className={cn({
													"!bg-primary !text-white": pathname === item.url
												})}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Your Projects</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{projects?.map((project) => {
								return (
									<SidebarMenuItem key={project.id}>
										<SidebarMenuButton asChild>
											<div onClick={() => setActiveProjectId(project.id)}>
												<div
													className={cn(
														"rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
														{
															"bg-primary text-white":
																project.id === activeProjectId
														}
													)}>
													{project.name[0]}
												</div>
												<span>{project.name}</span>
											</div>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
							<div className="h-2"></div>
							{open && (
								<SidebarMenuItem>
									<Link href="/create">
										<Button size="sm" variant="outline" className="w-fit">
											<Plus />
											Create Project
										</Button>
									</Link>
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
