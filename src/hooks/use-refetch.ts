"use client";

import { useQueryClient } from "@tanstack/react-query";

export default function useRefetch() {
	const queryClient = useQueryClient();
	return async () => {
		await queryClient.refetchQueries({
			type: "active"
		});
	};
}
