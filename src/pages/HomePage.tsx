import { Header } from '@/components/header/index';
import { NotesList } from '@/components/notes/NotesList';
import Link from '@/components/utils/Link';
import type { NoteListItem } from '@/lib/repo/notesRepo';
import type { Idea } from '@/lib/repo/ideasRepo';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { ProductsShowcase } from '@/components/products/ProductsShowcase';

export default function HomePage({ notes, notesCount, latestIdea }: {
	notes: NoteListItem[];
	notesCount: number;
	latestIdea?: Idea;
}) {
	return (
		<div>
			<Header />
			<div className='px-8'>
				<NotesList notes={notes} />
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
				<ProductsShowcase />
			</div>
		</div>
	)
}
