"use client";

import { useNav } from "@/components/nav";

export default function NotesPageClient() {
	const nav = useNav();

	nav.useBackButton();

	return null;
}