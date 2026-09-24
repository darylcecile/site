import studio from '@/../studio';
import { generateIdFromText } from '@/lib/generateIdFromText';

export async function getIdeas() {
	const entries = await studio.getCollection('ideas').getEntries();
	return entries
		.filter(entry => !entry.metadata.hidden)
		.sort((a, b) => (b.metadata.lastUpdated ?? b.metadata.date)
			.localeCompare(a.metadata.lastUpdated ?? a.metadata.date));
}

export async function getIdea(slug: string) {
	return (await getIdeas()).find(entry => entry.slug === slug);
}

export type Idea = Awaited<ReturnType<typeof getIdeas>>[number];

// Section titles are plain-text H2s; fenced examples must not enter the contents.
export function getIdeaSections(content: string) {
	const prose = content.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
	return [...prose.matchAll(/^## (.+)$/gm)].map(([, title]) => ({
		title,
		id: generateIdFromText(title),
	}));
}
