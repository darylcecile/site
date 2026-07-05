import { getAllProjectsDataSorted } from "@/lib/repo/projectsRepo";
import { getAggregatedRepoStats } from "@/lib/repo/githubRepo";
import { ProjectsExplorer } from "./ProjectsExplorer";
import type { ProjectCardData } from "./ProjectCard";

function resolveImage(image?: string): string | undefined {
	if (!image) return undefined;
	return URL.canParse(image) ? image : `/images/projects/${image}`;
}

// The stored `summary` is rendered HTML; derive a short plain-text excerpt from the
// first paragraph of the raw markdown so cards show clean text (and we don't ship the
// whole article body to the client).
function toPlainSummary(markdown: string | undefined, max = 180): string {
	if (!markdown) return "";
	const firstParagraph = markdown.trim().split(/\n\s*\n/)[0] ?? "";
	const text = firstParagraph
		.replace(/<[^>]+>/g, " ") // html / mdx tags
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> label
		.replace(/[*_`>#]/g, "") // emphasis / marks
		.replace(/\s+/g, " ")
		.trim();
	if (text.length <= max) return text;
	const truncated = text.slice(0, max);
	const lastSpace = truncated.lastIndexOf(" ");
	return `${(lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}…`;
}

export async function ProjectsList() {
	const projects = await getAllProjectsDataSorted();

	const enriched: ProjectCardData[] = await Promise.all(
		projects.map(async (project) => {
			const stats = project.repo
				? await getAggregatedRepoStats(project.repo)
				: null;

			return {
				id: project.id,
				name: project.name,
				summary: toPlainSummary(project.content),
				startYear: project.startYear,
				endYear: project.endYear,
				image: resolveImage(project.image),
				tokens: project.tokens ?? [],
				sticky: project.sticky,
				stats: stats
					? {
							commitsCount: stats.commitsCount,
							lastUpdated: stats.lastUpdated,
							repoCount: stats.repos.length,
						}
					: null,
			} satisfies ProjectCardData;
		}),
	);

	return <ProjectsExplorer projects={enriched} />;
}