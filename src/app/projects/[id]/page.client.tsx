"use client";

import { useNav } from "@/components/nav";

export default function ProjectsPageClient() {
	const nav = useNav();

	nav.useBackButton();

	return null;
}