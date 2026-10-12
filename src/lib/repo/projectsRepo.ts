import { content } from '@/generated/content/metadata.server';
import type { ContentEntry } from '@/lib/content/types';

export type Project = ContentEntry<'projects'>['metadata'] & {
	id: string;
	summary: string;
	content: string;
};

function toProject(entry: ContentEntry<'projects'>): Project {
	return {
		...entry.metadata,
		id: entry.slug,
		summary: entry.renderedContent,
		content: entry.content,
	};
}

export function getAllProjectsDataSorted() {
	return content.projects.map(toProject).sort((a, b) => {
		// Sticky projects first.
		if (!!a.sticky !== !!b.sticky) return a.sticky ? -1 : 1;

		// Ongoing projects (no endYear) before completed ones.
		const aOngoing = a.endYear == null;
		const bOngoing = b.endYear == null;
		if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

		// More recently started projects first.
		if (a.startYear !== b.startYear) return b.startYear - a.startYear;

		// Tiebreak: more recently ended first.
		const ae = a.endYear ?? Number.POSITIVE_INFINITY;
		const be = b.endYear ?? Number.POSITIVE_INFINITY;
		return be - ae;
	});
}

export function getProjectData(id: string) {
	const project = content.projects.find(project => project.slug === id);
	return project ? toProject(project) : null;
}

function toPlainSummary(markdown: string, max = 180): string {
	const firstParagraph = markdown.trim().split(/\n\s*\n/)[0] ?? '';
	const text = firstParagraph
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`>#]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (text.length <= max) return text;
	const truncated = text.slice(0, max);
	const lastSpace = truncated.lastIndexOf(' ');
	return `${(lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}…`;
}

function toProjectPage(project: Project) {
	const { id, name, summary, startYear, endYear, image, link, tokens, sticky, repo } = project;
	return {
		id, name, summary, startYear, endYear, link, tokens: tokens ?? [], sticky, repo,
		image: !image ? undefined : URL.canParse(image) ? image : `/images/projects/${image}`,
	};
}

export function getProjectPage(id: string) {
	const project = getProjectData(id);
	return project ? toProjectPage(project) : null;
}

export type ProjectPageData = NonNullable<ReturnType<typeof getProjectPage>>;

export function getProjectCards() {
	return getAllProjectsDataSorted().map(project => ({
		...toProjectPage(project),
		summary: toPlainSummary(project.content),
	}));
}
