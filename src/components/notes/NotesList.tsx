import { cn } from "@/lib/utils";
import { GeistSans } from '@/lib/fonts';
import NotesListItem from '@/components/notes/NotesListItem';
import type { NoteListItem } from '@/lib/repo/notesRepo';

type NotesListProps = {
	notes: NoteListItem[];
}

export function NotesList({ notes }: NotesListProps) {
	return (
		<div className={cn(GeistSans.className, 'max-w-2xl w-full mx-auto gap-4 flex flex-col mb-8')}>
			{notes.map((note, i) => (
				<NotesListItem key={note.slug} note={note} index={i} />
			))}
		</div>
	)
}
