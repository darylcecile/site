"use client";

import { generateIdFromText } from '@/lib/generateIdFromText';
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentType, JSX, PropsWithChildren } from "react";
import { useScrollHintHeading } from "./ScrollHint";

type HeadingProps = PropsWithChildren<{
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	className?: string;
}>;

type H = `h${1 | 2 | 3 | 4 | 5 | 6}`;

export function Heading({ level = 1, ...props }: HeadingProps) {
	const HeadingTag = `h${level}` as H;
	const sectionId = generateIdFromText(props.children as string);

	const isActive = useScrollHintHeading(sectionId, props.children.toString());

	return (

		<HeadingTag {...props} className={cn(props.className, 'inline')} id={sectionId}>
			<Link
				href={`#${sectionId}`}
				className={cn(
					"relative before:right-full before:align-middle before:absolute before:content-['#'] before:text-foreground/50 before:mr-2 before:opacity-0 group hover:before:opacity-100 focus-visible:before:opacity-100 no-underline not-prose"
				)}
			>
				{props.children}
			</Link>
		</HeadingTag>

	);
}