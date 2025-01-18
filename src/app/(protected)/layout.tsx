import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";

export default function SidebarLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-full m-2">
				<div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
					{/* <SearchBar /> */}
					<div className="ml-auto"></div>
					{/* <UserButton /> */}
				</div>
				<div className="h-4"></div>
				{/* main content */}
				<div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
					{children}
				</div>
			</main>
		</SidebarProvider>
	);
}
