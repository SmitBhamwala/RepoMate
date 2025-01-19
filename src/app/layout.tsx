import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
	title: "AI-GitHub-Summary",
	description: "Generate GitHub repo's summary using AI"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${poppins.className} antialiased`}>
				<SessionProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
					<Toaster richColors />
				</SessionProvider>
			</body>
		</html>
	);
}
