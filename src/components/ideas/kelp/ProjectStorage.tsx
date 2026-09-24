'use client';

import { useState } from 'react';
import { Experiment, experimentButton } from '../Experiment';

const models = [
	{
		label: 'Copy the repository',
		store: 'The repository copies on these servers hold the durable history.',
		nodes: ['Repository copy', 'Repository copy', 'Repository copy'],
		benefit: 'More copies can share the work of serving readers, and preserve data if a server fails.',
		coordination: 'The host must keep the copies consistent. Each copy still contains the repository; adding one doesn’t divide its contents into smaller pieces.',
		lesson: 'Replication gives you extra copies. It does not, by itself, split up one project’s stored data.',
	},
	{
		label: 'Keep a durable log',
		store: 'Object storage holds the accepted push log and the data needed to rebuild a repository.',
		nodes: ['Cached repository', 'Cached repository', 'Cached repository'],
		benefit: 'Serving copies become replaceable. A new server can rebuild from the log, and readers can use more copies without making every copy participate in each write.',
		coordination: 'Accepted pushes still need an agreed order. Copies must catch up before serving current data, and repository maintenance still has a cost.',
		lesson: 'This sketches the approach described by Cursor’s Continuity. A WAL changes where durable truth lives; it does not remove coordination.',
	},
	{
		label: 'Split the project’s data',
		store: 'Proposed Kelp: one project version names saved content distributed across storage groups.',
		nodes: ['Some saved content', 'Other saved content', 'More saved content'],
		benefit: 'Adding storage can hold another portion of the same project. Separate records for unrelated proposals can be handled independently too.',
		coordination: 'Accepting work into one shared project version still needs an ordered decision. The required contents must be safely stored before that version becomes visible.',
		lesson: 'This is Kelp’s proposed direction, not a feature of its current server. Real deployments would also keep additional copies of each portion for resilience.',
	},
];

export function ProjectStorage() {
	const [selected, setSelected] = useState(0);
	const model = models[selected];
	return (
		<Experiment number="05" title="What does adding a server actually change?" description="Compare three storage approaches. Each solves a different part of the problem; these diagrams are not performance measurements." kind="Architecture sketches" onReset={() => setSelected(0)}>
			<div role="group" aria-label="Storage approaches" className="mb-5 flex flex-wrap gap-2">
				{models.map((item, index) => <button key={item.label} type="button" className={`${experimentButton} ${index === selected ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300' : ''}`} aria-pressed={index === selected} onClick={() => setSelected(index)}>{item.label}</button>)}
			</div>
			<div aria-live="polite" aria-atomic="true">
				<p className="rounded-lg border border-emerald-700/40 bg-emerald-500/5 p-4 text-sm">{model.store}</p>
				<div className="my-4 grid gap-3 sm:grid-cols-3">
					{model.nodes.map((label, index) => <div key={index} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{selected === 2 ? 'Storage group' : 'Serving machine'} {index + 1}</p><p className="mt-2 text-sm font-medium">{label}</p></div>)}
				</div>
				<dl className="space-y-4 text-sm leading-7">
					<div><dt className="font-medium">What another machine helps with</dt><dd className="mt-1 text-muted-foreground">{model.benefit}</dd></div>
					<div><dt className="font-medium">What still needs care</dt><dd className="mt-1 text-muted-foreground">{model.coordination}</dd></div>
				</dl>
				<p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">{model.lesson}</p>
			</div>
		</Experiment>
	);
}
