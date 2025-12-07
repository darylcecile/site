import roll from "./roll.json";
import { cn } from '@/lib/utils';
import { GeistSans } from 'geist/font/sans';

const rainbowColors = [
	{ text: 'text-red-500', bg: 'focus-within:bg-red-500/10', var: '--color-red-500' },
	{ text: 'text-yellow-500', bg: 'focus-within:bg-yellow-500/10', var: '--color-yellow-500' },
	{ text: 'text-green-500', bg: 'focus-within:bg-green-500/10', var: '--color-green-500' },
	{ text: 'text-blue-500', bg: 'focus-within:bg-blue-500/10', var: '--color-blue-500' },
	{ text: 'text-indigo-500', bg: 'focus-within:bg-indigo-500/10', var: '--color-indigo-500' },
	{ text: 'text-purple-500', bg: 'focus-within:bg-purple-500/10', var: '--color-purple-500' },
	{ text: 'text-pink-500', bg: 'focus-within:bg-pink-500/10', var: '--color-pink-500' }
];

export default function BookmarksPage() {

	roll.sort((a, b) => {
		if (a.owner < b.owner) return -1;
		if (a.owner > b.owner) return 1;
		return 0;
	});

	return (
		<div className='px-8 flex flex-col gap-12 pt-20'>
			<div className='max-w-2xl mx-auto gap-8 flex flex-col w-full'>
				<h1 className='text-3xl'>Bookmarks</h1>
				<p className='text-muted-foreground'>A collection of blogs and websites I frequently visit and/or recommend.</p>
			</div>

			<div className={cn(GeistSans.className, 'max-w-2xl w-full mx-auto gap-4 flex flex-col mb-8 prose text-foreground/70')}>
				<ul>
					{roll.map((item, i) => (
						<li key={i} className="list-disc">
							{item.owner}'s{' '}
							<a
								href={item.link}
								target="_blank"
								rel="noopener noreferrer"
								className={cn('underline', rainbowColors[i % rainbowColors.length].text)}
							>
								{item.title}
							</a>
							{item.rss !== undefined ? (
								<span> (<a
									href={item.rss}
									target="_blank"
									rel="noopener noreferrer"
									className={cn("text-muted-foreground")}
								>RSS</a>)</span>
							) : null}
							{item.tags.map(t => ` #${t.toLowerCase().replaceAll(' ', '_')}`).join(', ')}
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}