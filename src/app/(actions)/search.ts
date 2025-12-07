"use server";

import Fuse from 'fuse.js';
import { getAllNotesDataSorted } from "@/lib/repo/notesRepo";
import { getAllProjectsDataSorted } from "@/lib/repo/projectsRepo";

export async function search(query: string) {
	const notes = await getAllNotesDataSorted();
	const projects = await getAllProjectsDataSorted();

	const items = [] as Array<{
		type: 'note' | 'project';
		title: string;
		slug: string;
		content: string;
		keywords: string[];
	}>;

	for (const note of notes) {
		items.push({
			type: 'note',
			title: note.title,
			slug: note.slug,
			content: note.content,
			keywords: []
		});
	}

	for (const project of projects) {
		items.push({
			type: 'project',
			title: project.name,
			slug: project.id,
			content: project.summary,
			keywords: project.tokens
		});
	}

	const fuse = new Fuse(items, {
		keys: ['title', 'content', 'slug', 'keywords'],
		threshold: 0.3,
		includeScore: true,
		useExtendedSearch: true,
	});

	const result = fuse.search(query);

	return result.map(entry => {
		return entry.item
	});
}