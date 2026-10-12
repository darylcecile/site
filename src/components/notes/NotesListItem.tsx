
import { cn } from '@/lib/utils';
import Link from '@/components/utils/Link';
import { ViewTransition } from 'react'
import type { NoteListItem } from '@/lib/repo/notesRepo';

const rainbowColors = [
	{ text: 'text-red-500', bg: 'focus-within:bg-red-500/10', var: '--color-red-500' },
	{ text: 'text-yellow-500', bg: 'focus-within:bg-yellow-500/10', var: '--color-yellow-500' },
	{ text: 'text-green-500', bg: 'focus-within:bg-green-500/10', var: '--color-green-500' },
	{ text: 'text-blue-500', bg: 'focus-within:bg-blue-500/10', var: '--color-blue-500' },
	{ text: 'text-indigo-500', bg: 'focus-within:bg-indigo-500/10', var: '--color-indigo-500' },
	{ text: 'text-purple-500', bg: 'focus-within:bg-purple-500/10', var: '--color-purple-500' },
	{ text: 'text-pink-500', bg: 'focus-within:bg-pink-500/10', var: '--color-pink-500' }
];

export default function NotesListItem(props: { note: NoteListItem, index: number }) {
	const { note, index: i } = props;

	return (
		<Link
			href={`/notes/${note.slug}`}
			className={cn(
				"rounded-lg -mx-4 px-4 py-3 transition-all duration-300 ease-in-out",
				"hover:bg-muted/40 hover:backdrop-blur-2xl hover:backdrop-saturate-150",
				"outline-transparent cursor-pointer relative overflow-hidden group",
				"focus-visible:outline-2 focus-visible:outline-muted focus-visible:outline-offset-1",
				"focus-visible:bg-muted/40 focus-visible:backdrop-blur-2xl focus-visible:backdrop-saturate-150"
			)}
		>
			<ViewTransition name={`notes-${note.slug}`}>
				<h1 className="text-foreground text-lg">{note.title}</h1>
				<p className="text-foreground text-sm opacity-75">{note.publishDateLabel} &middot; {note.readTime}</p>
			</ViewTransition>
			<span className={cn('text-foreground text-xs', rainbowColors[i % rainbowColors.length].text)}>Read more</span>

			<div
				className={cn(
					'transition-all duration-300 ease-in-out ',
					'absolute w-full h-full top-0 left-0 blur-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
				)}
				style={{
					background: `linear-gradient(to bottom left, transparent 25%, transparent 75%, var(${rainbowColors[i % rainbowColors.length].var}) 100%)`,
				}}
			/>
		</Link>
	)
}
