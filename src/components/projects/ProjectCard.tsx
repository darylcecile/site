"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { cn } from "@/lib/utils";
import { rainbowAt } from "./rainbow";

export type ProjectRepoStats = {
	commitsCount: number | null;
	lastUpdated: string | null;
	repoCount: number;
};

export type ProjectCardData = {
	id: string;
	name: string;
	summary: string;
	startYear: number;
	endYear?: number;
	/** Already resolved to a full URL / public path by the server. */
	image?: string;
	tokens: string[];
	sticky?: boolean;
	stats?: ProjectRepoStats | null;
};

function formatUpdated(iso: string | null | undefined): string | null {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function yearRange(startYear: number, endYear?: number): string {
	if (endYear == null) return `${startYear} – Ongoing`;
	if (endYear === startYear) return `${startYear}`;
	return `${startYear} – ${endYear}`;
}

/**
 * A single project as a borderless grid card in the site's house style: an index-keyed
 * rainbow accent, a grayscale→colour thumbnail, and a rainbow corner-glow revealed on
 * hover/focus. Repo stats fold into the muted meta line; tokens read as muted #hashtags.
 */
export function ProjectCard({
	project,
	index,
}: {
	project: ProjectCardData;
	index: number;
}) {
	const rainbow = rainbowAt(index);

	const commits = project.stats?.commitsCount ?? null;
	const repoCount = project.stats?.repoCount ?? 0;
	const updated = formatUpdated(project.stats?.lastUpdated);

	const meta = [
		yearRange(project.startYear, project.endYear),
		repoCount > 1 ? `${repoCount} repos` : null,
		commits != null
			? `${commits.toLocaleString()} commit${commits === 1 ? "" : "s"}`
			: null,
		updated ? `Updated ${updated}` : null,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<Link
			href={`/projects/${project.id}`}
			className={cn(
				"group relative flex flex-col overflow-hidden rounded-lg p-3",
				"transition-all duration-300 ease-in-out",
				"hover:bg-muted/40 hover:backdrop-blur-2xl hover:backdrop-saturate-150",
				"outline-transparent cursor-pointer",
				"focus-visible:outline-2 focus-visible:outline-muted focus-visible:outline-offset-1",
				"focus-visible:bg-muted/40 focus-visible:backdrop-blur-2xl focus-visible:backdrop-saturate-150",
			)}
		>
			{project.image ? (
				<ViewTransition name={`projects-image-${project.id}`}>
					<div className="z-2 aspect-video w-full overflow-hidden rounded-sm border border-border bg-muted">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={project.image}
							alt=""
							loading="lazy"
							className={cn(
								"h-full w-full object-cover transition-all duration-300 ease-in-out",
								// Grayscale on pointer devices (colour on hover); full colour on touch.
								"[@media(hover:hover)]:saturate-0 group-hover:saturate-100 group-focus-within:saturate-100",
							)}
						/>
					</div>
				</ViewTransition>
			) : (
				<div
					aria-hidden
					className="z-2 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm border border-border bg-muted"
				>
					<div
						className="absolute inset-0 opacity-30"
						style={{
							background: `linear-gradient(135deg, transparent 35%, var(${rainbow.var}) 165%)`,
						}}
					/>
					<span
						className={cn(
							"relative px-4 text-center text-lg font-medium text-balance",
							rainbow.text,
						)}
					>
						{project.name}
					</span>
				</div>
			)}

			<div className="z-2 mt-3 flex flex-1 flex-col">
				<ViewTransition name={`projects-${project.id}`}>
					<h2 className="text-foreground text-lg leading-snug">{project.name}</h2>
					<p className="text-foreground text-sm opacity-75">{meta}</p>
				</ViewTransition>

				{project.summary && (
					<p className="mt-1 line-clamp-2 text-sm text-foreground/70">
						{project.summary}
					</p>
				)}

				<div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
					{project.tokens.length > 0 && (
						<span className="text-xs text-muted-foreground/75">
							{project.tokens
								.map((token) => `#${token.toLowerCase()}`)
								.join(" ")}
						</span>
					)}
					<span className={cn("ml-auto text-xs", rainbow.text)}>Read more</span>
				</div>
			</div>

			{/* Rounded clip wrapper (no backdrop-filter) so the blurred glow is reliably
			    clipped to the card's rounded corners. Clipping directly on the Link fails
			    because its hover backdrop-filter defeats border-radius clipping of the
			    composited, blurred child in Chromium. */}
			<div
				aria-hidden
				className="absolute inset-0 overflow-hidden rounded-lg"
			>
				<div
					className={cn(
						"absolute inset-0 opacity-0 blur-2xl transition-all duration-300 ease-in-out",
						"group-hover:opacity-100 group-focus-within:opacity-100",
					)}
					style={{
						background: `linear-gradient(to bottom left, transparent 25%, transparent 75%, var(${rainbow.var}) 100%)`,
					}}
				/>
			</div>
		</Link>
	);
}
