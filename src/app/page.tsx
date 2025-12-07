import { Header } from '@/components/header/index';
import { NotesList } from '@/components/notes/NotesList';
import Link from 'next/link';
import studio from 'studio';

export default async function Page() {
	const notes = await studio.getCollection('notes').getEntries();
	const notesCount = notes.filter(note => !note.metadata.hidden).length;

	return (
		<div>
			<Header />
			<div className='px-8'>
				<NotesList maxItems={7} />
				<div className='max-w-2xl mx-auto w-full border-t border-border/50 mb-10 flex items-center justify-end'>
					<p className='text-sm pt-4'>
						Looking for more? <Link className='text-foreground/50 hover:underline underline-offset-2' href="/notes">View all {notesCount} notes</Link> →
					</p>
				</div>

			</div>
		</div>
	)
}