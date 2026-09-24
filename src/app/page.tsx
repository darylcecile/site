import { Header } from '@/components/header/index';
import { NotesList } from '@/components/notes/NotesList';
import Link from 'next/link';
import studio from 'studio';
import { getIdeas } from '@/lib/repo/ideasRepo';
import { IdeaCard } from '@/components/ideas/IdeaCard';

export default async function Page() {
	const notes = await studio.getCollection('notes').getEntries();
	const notesCount = notes.filter(note => !note.metadata.hidden).length;
	const [latestIdea] = await getIdeas();

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
				{latestIdea && <section aria-labelledby="ideas-heading" className="max-w-2xl mx-auto w-full my-14">
					<div className="mb-5 flex items-center justify-between gap-4">
						<h2 id="ideas-heading" className="text-xl">Ideas I’m exploring</h2>
						<Link href="/ideas" className="text-sm text-muted-foreground hover:underline underline-offset-4">All ideas →</Link>
					</div>
					<IdeaCard idea={latestIdea} />
				</section>}
			</div>
		</div>
	)
}
