import NotesPageClient from '@/components/notes/NoteInteractions';
import { ScrollHint } from '@/components/notes/ScrollHint';
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import { cn } from "@/lib/utils";
import { ViewTransition } from 'react';
import LocalDate from '@/components/utils/LocalDate';
import type { NotePageData } from '@/lib/repo/notesRepo';
import { MFPostArticle, MFPostContent } from '@/components/microformats/blog';

export default function NotePage({ note: postData }: { note: NotePageData }) {
	return (
		<MFPostArticle className="content px-8 h-entry">
			<div className="max-w-2xl mx-auto w-full pt-20">
				<ViewTransition name={`notes-${postData.slug}`}>
					<MFPostContent className="text-3xl text-balance">{postData.metadata.title}</MFPostContent>
					<p className="text-foreground/85 prose metalic-dark">
						<LocalDate dateString={postData.metadata.date} className="dt-published" /> &middot;{" "}
						{postData.readTime}
					</p>
				</ViewTransition>
				{!!postData.metadata.lastUpdated && (
					<p className="text-foreground/85 prose">
						<strong>Last updated: </strong>
						<LocalDate dateString={postData.metadata.lastUpdated} className='dt-updated' />
					</p>
				)}
			</div>
			<br />
			<NotesPageClient>
				<div
					className={cn(
						"mx-auto wider-content content prose dark:prose-invert tracking-wide",
						"prose-a:hover:text-pink-400 prose-a:underline-offset-2 prose-img:rounded-lg",
						"prose-figcaption:text-center prose-h5:font-medium prose-h5:text-foreground",
						"prose-headings:inline-block prose-headings:mt-1 prose-headings:mb-2!"
					)}
				>
					<MFPostContent className="max-w-2xl mx-auto w-full text-foreground/85">
						<MarkdownRenderer collection="notes" slug={postData.slug} />
					</MFPostContent>
				</div>
			</NotesPageClient>
			{/* <div className={galleryStyles.workAroundTodoGalleryStyles} /> */}

			<ScrollHint />
		</MFPostArticle>
	);
}
