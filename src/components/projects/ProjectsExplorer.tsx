"use client";

import { useMemo, useState } from "react";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import { ProjectCard, type ProjectCardData } from "./ProjectCard";
import { rainbowAt } from "./rainbow";

export function ProjectsExplorer({ projects }: { projects: ProjectCardData[] }) {
	const [activeTokens, setActiveTokens] = useState<string[]>([]);

	// Fix each project's rainbow colour to its position in the full sorted list so a
	// project's accent never changes as the list is filtered.
	const rainbowIndex = useMemo(() => {
		const map = new Map<string, number>();
		projects.forEach((project, i) => map.set(project.id, i));
		return map;
	}, [projects]);

	const tokenCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const project of projects) {
			for (const token of project.tokens) {
				counts.set(token, (counts.get(token) ?? 0) + 1);
			}
		}
		return [...counts.entries()].sort(
			(a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
		);
	}, [projects]);

	const hasFilters = activeTokens.length > 0;

	// Token filters use OR/union semantics: match any selected token.
	const filtered = useMemo(() => {
		if (activeTokens.length === 0) return projects;
		return projects.filter((project) =>
			activeTokens.some((token) => project.tokens.includes(token)),
		);
	}, [projects, activeTokens]);

	// Featured (sticky) projects are pinned to the front of the list in the unfiltered
	// view; they carry no heading — they simply show up first.
	const featured = hasFilters ? [] : filtered.filter((p) => p.sticky);
	const featuredIds = new Set(featured.map((p) => p.id));
	const rest = filtered.filter((p) => !featuredIds.has(p.id));
	const ordered = hasFilters ? filtered : [...featured, ...rest];

	const toggleToken = (token: string) =>
		setActiveTokens((current) =>
			current.includes(token)
				? current.filter((t) => t !== token)
				: [...current, token],
		);

	const reset = () => setActiveTokens([]);

	const card = (project: ProjectCardData) => (
		<ProjectCard
			key={project.id}
			project={project}
			index={rainbowIndex.get(project.id) ?? 0}
		/>
	);

	return (
		<div className={cn(GeistSans.className, "max-w-2xl w-full mx-auto flex flex-col gap-8")}>
			{tokenCounts.length > 0 && (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
					{tokenCounts.map(([token, count], i) => {
						const active = activeTokens.includes(token);
						return (
							<button
								key={token}
								type="button"
								onClick={() => toggleToken(token)}
								aria-pressed={active}
								className={cn(
									"underline-offset-4 transition-colors hover:underline",
									rainbowAt(i).text,
									active ? "underline" : "opacity-70 hover:opacity-100",
								)}
							>
								#{token.toLowerCase()}
								<span className="ml-1 text-xs opacity-60">{count}</span>
							</button>
						);
					})}
					{hasFilters && (
						<button
							type="button"
							onClick={reset}
							className="text-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline"
						>
							clear
						</button>
					)}
				</div>
			)}

			{filtered.length === 0 ? (
				<p className="py-8 text-sm text-muted-foreground">
					No projects match those filters.{" "}
					<button
						type="button"
						onClick={reset}
						className="text-foreground underline underline-offset-4"
					>
						Clear filters
					</button>
				</p>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 -mx-3">
					{ordered.map((p) => card(p))}
				</div>
			)}
		</div>
	);
}
