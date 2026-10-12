import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { content } from '@/generated/content/metadata.server';
import type { ContentEntry } from '@/lib/content/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

export type Note = ContentEntry<'notes'>['metadata'] & {
	slug: string;
	content: string;
	renderedContent: string;
	readTime: string;
};

export async function getNotes() {
	return [...content.notes];
}

export async function getNote(slug: string) {
	return content.notes.find(note => note.slug === slug);
}

export function getPublicNotes(maxItems?: number) {
	const now = Date.now();
	return getAllNotesDataSorted()
		.filter(note => dayjs.tz(note.date, 'YYYY-MM-DD', 'Europe/London').valueOf() < now)
		.slice(0, maxItems)
		.map(note => ({
			slug: note.slug,
			title: note.title,
			publishDateLabel: dayjs.tz(note.date, 'YYYY-MM-DD', 'Europe/London').format('ddd Do MMM[,] YYYY'),
			readTime: dayjs.duration({ minutes: Math.ceil(note.content.split(' ').length / 200) }).humanize(),
		}));
}

export type NoteListItem = ReturnType<typeof getPublicNotes>[number];

export async function getNotePage(slug: string) {
	const note = await getNote(slug);
	if (!note) return null;
	const { title, snippet, date, lastUpdated } = note.metadata;
	return { slug: note.slug, readTime: note.readTime, metadata: { title, snippet, date, lastUpdated } };
}

export type NotePageData = NonNullable<Awaited<ReturnType<typeof getNotePage>>>;

function toNote(entry: ContentEntry<'notes'>): Note {
	return {
		...entry.metadata,
		slug: entry.slug,
		content: entry.content,
		renderedContent: entry.renderedContent,
		readTime: entry.readTime,
	};
}

export function getAllNotesDataSorted() {
	return content.notes
		.filter(note => !note.metadata.hidden)
		.map(toNote)
		.sort((a, b) => {
			if ((a.lastUpdated ?? a.date) < (b.lastUpdated ?? b.date)) {
				return 1;
			}
			return -1;
		});
}
