import { getAllNotesDataSorted } from "@/lib/repo/notesRepo";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);

export function NotesList() {
	const currentDate = dayjs().tz("Europe/London");

	const publicNotes = getAllNotesDataSorted(false).map(note => {
		return {
			...note,
			publishDate: dayjs.tz(note.date, "YYYY-MM-DD", "Europe/London"),
			readTime: dayjs.duration({
				minutes: Math.ceil(note.content.split(" ").length / 200)
			}).humanize()
		}
	}).filter((note) => {
		return !note.hidden && note.publishDate.toDate() < currentDate.toDate();
	});

	const rainbowColors = [
		'text-red-500',
		'text-yellow-500',
		'text-green-500',
		'text-blue-500',
		'text-indigo-500',
		'text-purple-500',
		'text-pink-500',
	];

	return (
		<div className={cn(GeistSans.className, 'max-w-2xl mx-auto gap-8 flex flex-col mb-8')}>
			{publicNotes.map((note, i) => (
				<div key={note.slug}>
					<h1 className="text-lg">{note.title}</h1>
					<p className="text-sm opacity-75">{dayjs.tz(note.publishDate).format('ddd Do MMM[,] YYYY')} &middot; {note.readTime}</p>
					<a
						className={cn('text-foreground text-xs', rainbowColors[i % rainbowColors.length])}
						href={`/notes/${note.slug}`}
					>Read more</a>
				</div>
			))}
		</div>
	)
}