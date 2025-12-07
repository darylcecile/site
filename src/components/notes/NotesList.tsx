"use cache";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";
import NotesListItem from '@/components/notes/NotesListItem';

import { cacheLife } from "next/cache";
import ms from "ms";
import studio from "studio";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);

type NotesListProps = {
	maxItems?: number;
}

export async function NotesList(props: NotesListProps) {
	cacheLife({ revalidate: ms("1h") / 1000 }); // 1 hour in seconds
	const currentDate = dayjs().tz("Europe/London");

	const notes = await studio.getCollection('notes').getEntries();

	notes.sort((a, b) => {
		if ((a.metadata.lastUpdated ?? a.metadata.date) < (b.metadata.lastUpdated ?? b.metadata.date)) {
			return 1;
		}
		return -1;
	});

	const publicNotes = notes.map(note => {
		return {
			slug: note.slug,
			...note.metadata,
			content: note.content,
			publishDate: dayjs.tz(note.metadata.date, "YYYY-MM-DD", "Europe/London").toDate(),
			readTime: dayjs.duration({
				minutes: Math.ceil(note.content.split(" ").length / 200)
			}).humanize()
		}
	}).filter((note) => {
		return !note.hidden && note.publishDate < currentDate.toDate();
	}).slice(0, props.maxItems);

	return (
		<div className={cn(GeistSans.className, 'max-w-2xl w-full mx-auto gap-4 flex flex-col mb-8')}>
			{publicNotes.map((note, i) => (
				<NotesListItem key={note.slug} note={note} index={i} />
			))}
		</div>
	)
}