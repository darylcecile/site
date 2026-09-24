'use client';

import { useState } from 'react';
import { Experiment, experimentButton } from '../Experiment';

const proposals = [
	{ author: 'Maya', seconds: 5 },
	{ author: 'Leo', seconds: 10 },
] as const;

type Author = typeof proposals[number]['author'];

export function ConcurrentRevisions() {
	const [published, setPublished] = useState<Author[]>([]);
	const sharedProposals = proposals.filter(proposal => published.includes(proposal.author));
	const bothShared = published.length === 2;

	function publish(author: Author) {
		setPublished(previous => previous.includes(author) ? previous : [...previous, author]);
	}

	return (
		<Experiment number="03" title="Whose edit should Kelp keep?" description="Maya and Leo each started with the three-second fix. They chose different waiting times without seeing each other’s work. Share their edits in either order." kind="Works in the prototype" onReset={() => setPublished([])}>
			<p className="mb-4 rounded-lg bg-muted/40 p-3 text-sm">Both started from: <strong>Wait 3 seconds</strong></p>
			<div className="grid gap-3 sm:grid-cols-2">
				{proposals.map(({ author, seconds }) => {
					const shared = published.includes(author);
					return (
						<div key={author} className="rounded-xl border border-border p-4">
							<p className="text-sm font-medium">{author}’s edit</p>
							<p className="mt-2 text-lg">Wait {seconds} seconds</p>
							<p className="mt-2 text-xs text-muted-foreground">{shared ? 'Shared with the team' : `Only on ${author}’s computer`}</p>
							<button type="button" className={`${experimentButton} mt-4 w-full`} disabled={shared} onClick={() => publish(author)}>{shared ? `${author}’s edit is shared` : `Share ${author}’s edit`}</button>
						</div>
					);
				})}
			</div>
			<div aria-live="polite" aria-atomic="true" className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
				<p className="text-sm font-medium">What the team can choose from</p>
				<ul className="mt-3 space-y-2 text-emerald-800 dark:text-emerald-300">
					{sharedProposals.length ? sharedProposals.map(({ author, seconds }) => <li key={author}>{author}’s version: wait {seconds} seconds</li>) : <li>The original fix: wait 3 seconds</li>}
				</ul>
				<p className="mt-3 min-h-20 text-sm leading-7 text-muted-foreground">{bothShared
					? 'Both edits are available. Sharing last didn’t erase the other person’s work. The team still needs to decide which waiting time to use; Kelp cannot make that decision for them.'
					: published.length
						? `${published[0]} has shared an update. The other person is still working from the original three-second fix. Their edit will remain a separate choice when they share it.`
						: 'Neither person has shared their edit yet. The team can still see only the original three-second fix.'}</p>
			</div>
			<p className="mt-4 text-xs leading-6 text-muted-foreground">The earlier three-second version stays in the history. Keeping competing versions already works; combining their edits into a new version is still planned.</p>
		</Experiment>
	);
}
