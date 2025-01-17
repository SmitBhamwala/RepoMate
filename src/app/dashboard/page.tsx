"use client";

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
	const { user } = useUser();

	return <div>{user?.firstName}</div>;
}
