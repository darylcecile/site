"use client";

import { useNav } from "@/components/nav";
import { useScrollHintHovered } from "@/components/notes/ScrollHint";
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { ComponentProps, PropsWithChildren } from "react";

type NotesPageClientProps = PropsWithChildren & ComponentProps<"div">;

export default function NotesPageClient(props: NotesPageClientProps) {
	const nav = useNav();
	const hintHovered = useScrollHintHovered();
	const isValidSize = useMediaQuery("(max-width: 900px)");

	nav.useBackButton();

	return (
		<div
			{...props}
			className={cn(props.style, "transition-filter duration-300", {
				"blur-xs": hintHovered && isValidSize,
			})}
		/>
	)
}