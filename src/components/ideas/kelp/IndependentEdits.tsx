'use client';

import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Experiment, experimentButton } from '../Experiment';
import { handbookView, originalHandbook, retryEdit, retryResolution, secondEdit } from './editModel';
import { cn } from '@/lib/utils';

function explainView(resolved: boolean, conflicted: boolean, sharedCount: number) {
	if (resolved) return 'Resolution saved. Both original edits remain in history.';
	if (conflicted) return 'Both versions remain. Neither edit replaces the other.';
	if (sharedCount === 2) return 'Both edits fit, in either order. Reset to try the reverse.';
	if (sharedCount === 1) return 'One edit received. Share the other to combine them.';
	return 'Share either edit to see the result.';
}

function versionColor(id: string) {
	if (id === retryEdit.id) return 'bg-blue-500';
	if (id === 'second-edit') return 'bg-pink-500';
	if (id === retryResolution.id) return 'bg-purple-500';
	return 'bg-muted-foreground/40';
}

export function IndependentEdits() {
	const [samePage, setSamePage] = useState(false);
	const [received, setReceived] = useState<string[]>([]);
	const [resolved, setResolved] = useState(false);
	const other = secondEdit(samePage);
	const drafts = [retryEdit, other];
	const shared = received.map(id => drafts.find(commit => commit.id === id)!);
	const commits = [originalHandbook, ...shared, ...(resolved ? [retryResolution] : [])];
	const pages = handbookView(commits);
	const conflicted = pages.some(page => page.versions.length > 1);

	function reset() {
		setReceived([]);
		setResolved(false);
	}

	function chooseOverlap(value: boolean) {
		if (samePage === value) return;
		setSamePage(value);
		reset();
	}

	function share(id: string) {
		setReceived(previous => previous.includes(id) ? previous : [...previous, id]);
	}

	return (
		<Experiment title="Does the order of sharing matter?" description="Two edits to the same starting handbook. Share them in either order." onReset={reset}>
			<div role="group" aria-label="What the editors change" className="mb-4 inline-flex max-w-full gap-1 rounded-md bg-muted/60 p-1">
				{[{ label: 'Different pages', overlap: false }, { label: 'Same paragraph', overlap: true }].map(option => <button
					key={option.label}
					type="button"
					className={cn('min-h-9 rounded-sm px-3 py-1.5 text-xs font-medium', samePage === option.overlap ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
					aria-pressed={samePage === option.overlap}
					onClick={() => chooseOverlap(option.overlap)}
				>{option.label}</button>)}
			</div>
			<div className="grid grid-cols-2 divide-x divide-border">
				{drafts.map((commit, index) => {
					const sent = received.includes(commit.id);
					return <div key={commit.id} className={cn('flex min-w-0 flex-col', index === 0 ? 'pr-4' : 'pl-4')}>
						<p className="flex items-center gap-2 text-xs font-medium"><span className={cn('size-1.5 rounded-full', versionColor(commit.id))} aria-hidden="true" />Editor {index + 1}</p>
						{Object.entries(commit.edits).map(([path, edit]) => <div key={path} className="mt-2 mb-3">
							<p className="truncate font-mono text-[11px] text-muted-foreground" title={path}>{path.split('/').at(-1)}</p>
							<p className="mt-2 text-xs leading-5">{edit.content}</p>
						</div>)}
						<button type="button" aria-label={sent ? `Editor ${index + 1}’s commit is shared` : `Share editor ${index + 1}’s commit`} className={cn(experimentButton, 'mt-auto inline-flex items-center justify-center gap-1.5 rounded-sm')} disabled={sent} onClick={() => share(commit.id)}>
							{sent ? <Check size={13} aria-hidden="true" /> : <ArrowUpRight size={13} aria-hidden="true" />}{sent ? 'Shared' : 'Share edit'}
						</button>
					</div>;
				})}
			</div>
			<div aria-live="polite" aria-atomic="true" className="mt-5 border-t border-border pt-4">
				<div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-medium">Shared result</p><span className={cn('text-[11px]', conflicted ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground')}>{conflicted ? 'Conflict' : resolved ? 'Resolved' : `${received.length} / 2 edits shared`}</span></div>
				<dl className="divide-y divide-border/60">
					{pages.map(page => <div key={page.path} className="py-3">
						<dt className="font-mono text-[11px] text-muted-foreground" title={page.path}>{page.path.split('/').at(-1)}</dt>
						<dd className="mt-2"><ul className="space-y-2">{page.versions.map(version => <li key={version.id} className="flex items-baseline gap-2 text-xs leading-5"><span className={cn('size-1.5 shrink-0 rounded-full', versionColor(version.id))} aria-hidden="true" />{version.content}</li>)}</ul></dd>
					</div>)}
				</dl>
				<p className="mt-2 text-xs leading-6 text-muted-foreground">{explainView(resolved, conflicted, received.length)}</p>
			</div>
			{conflicted && <button type="button" aria-label="Resolve using transient retries" className={`${experimentButton} mt-3 rounded-sm`} onClick={() => setResolved(true)}>Keep editor 1’s version</button>}
			<details className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
				<summary className="cursor-pointer rounded py-1.5 focus-visible:outline-2 focus-visible:outline-ring">Retained history · {commits.length} {commits.length === 1 ? 'record' : 'records'}</summary>
				<ul className="mt-2 space-y-2 pl-4">{commits.map(commit => <li key={commit.id} className="flex items-center gap-2"><Check size={12} aria-hidden="true" />{commit.label}</li>)}</ul>
				<p className="mt-3 pl-4 leading-5">Arrival order is shown here; it does not choose a winning version. This is a file-parent model, not a running CLI or text-merge engine.</p>
			</details>
		</Experiment>
	);
}
