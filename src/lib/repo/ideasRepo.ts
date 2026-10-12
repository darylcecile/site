import { content } from '@/generated/content/metadata.server';
import { generateIdFromText } from '@/lib/generateIdFromText';

export async function getIdeas() {
	return content.ideas
		.filter(entry => !entry.metadata.hidden)
		.sort((a, b) => (b.metadata.lastUpdated ?? b.metadata.date)
			.localeCompare(a.metadata.lastUpdated ?? a.metadata.date));
}

export async function getIdea(slug: string) {
	return (await getIdeas()).find(entry => entry.slug === slug);
}

function toIdeaSummary(entry: Awaited<ReturnType<typeof getIdeas>>[number]) {
	const { title, snippet, date, lastUpdated, status, icon, topics, repository } = entry.metadata;
	return {
		slug: entry.slug,
		readTime: entry.readTime,
		metadata: { title, snippet, date, lastUpdated, status, icon, topics, repository },
	};
}

export type Idea = ReturnType<typeof toIdeaSummary>;

export async function getIdeaSummaries() {
	return (await getIdeas()).map(toIdeaSummary);
}

export async function getIdeaPage(slug: string) {
	const idea = await getIdea(slug);
	return idea ? { ...toIdeaSummary(idea), sections: getIdeaSections(idea.content) } : null;
}

export type IdeaPageData = NonNullable<Awaited<ReturnType<typeof getIdeaPage>>>;

// Section titles are plain-text H2s; fenced examples must not enter the contents.
export function getIdeaSections(content: string) {
	const prose = content.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
	return [...prose.matchAll(/^## (.+)$/gm)].map(([, title]) => ({
		title,
		id: generateIdFromText(title),
	}));
}
