'use client';

import { useState } from 'react';
import { ArrowDown, Check, FileText } from 'lucide-react';
import { Experiment, experimentButton } from '../Experiment';
import { handbookView, originalHandbook, retryEdit, retryResolution, secondEdit } from './editModel';

function explainView(resolved: boolean, conflicted: boolean, sharedCount: number) {
	if (resolved) return 'The resolution names both competing versions as parents. Both original commits remain in the history below.';
	if (conflicted) return 'Both retry policies survive. The last commit received cannot erase the other one; neither was based on the other’s version.';
	if (sharedCount === 2) return 'Both edits fit. Reset and share them in the opposite order: you will get the same file contents without rewriting either commit.';
	if (sharedCount === 1) return 'One new commit has arrived. The other editor’s work has not been shared yet.';
	return 'Neither edit has arrived. These are the original pages both editors started from.';
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
		<Experiment number="01" title="Does the order of sharing matter?" description="Both editors started from the original handbook. Choose what the second editor changes, then share the two commits in either order." kind="File-version model" onReset={reset}>
			<div role="group" aria-label="What the second editor changes" className="mb-5 flex flex-wrap gap-2">
				<button type="button" className={`${experimentButton} ${!samePage ? 'border-blue-500 text-blue-700 dark:text-blue-300' : ''}`} aria-pressed={!samePage} onClick={() => chooseOverlap(false)}>A different page</button>
				<button type="button" className={`${experimentButton} ${samePage ? 'border-pink-500 text-pink-700 dark:text-pink-300' : ''}`} aria-pressed={samePage} onClick={() => chooseOverlap(true)}>The same retry paragraph</button>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				{drafts.map((commit, index) => <div key={commit.id} className={`flex flex-col rounded-xl border p-4 ${index === 0 ? 'border-blue-500/30 bg-blue-500/5' : 'border-pink-500/30 bg-pink-500/5'}`}>
					<p className="text-xs text-muted-foreground">Editor {index + 1}</p>
					<p className="mt-1 text-sm font-medium">{commit.label}</p>
					{Object.entries(commit.edits).map(([path, edit]) => <div key={path} className="my-3">
						<p className="break-all font-mono text-[11px] text-muted-foreground">{path}</p>
						<p className="mt-2 text-sm leading-6">“{edit.content}”</p>
					</div>)}
					<button type="button" className={`${experimentButton} mt-auto`} disabled={received.includes(commit.id)} onClick={() => share(commit.id)}>{received.includes(commit.id) ? 'Shared' : `Share editor ${index + 1}’s commit`}</button>
				</div>)}
			</div>
			<div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground"><ArrowDown size={15} aria-hidden="true" /> Combine the received records</div>
			<div aria-live="polite" aria-atomic="true" className="rounded-xl border border-border p-4">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">Shared file versions</p><span className={`text-xs ${conflicted ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'}`}>{conflicted ? 'A decision is needed' : 'One version per page'}</span></div>
				<div className="space-y-3">
					{pages.map(page => <div key={page.path} className="rounded-lg bg-muted/30 p-3">
						<p className="mb-2 flex items-start gap-2 break-all font-mono text-[11px] text-muted-foreground"><FileText size={13} className="shrink-0" aria-hidden="true" />{page.path}</p>
						<ul className="space-y-2">{page.versions.map(version => <li key={version.id} className={`rounded-md px-3 py-2 text-sm ${page.versions.length > 1 ? 'border border-red-500/25 bg-red-500/5' : 'bg-background'}`}>{version.content}</li>)}</ul>
					</div>)}
				</div>
				<p className="mt-4 text-sm leading-7 text-muted-foreground">{explainView(resolved, conflicted, received.length)}</p>
			</div>
			{conflicted && <button type="button" className={`${experimentButton} mt-4`} onClick={() => setResolved(true)}>Resolve using transient retries</button>}
			<div className="mt-5 border-t border-border pt-4">
				<p className="text-xs font-medium">Retained history <span className="font-normal text-muted-foreground">· shown in arrival order, not a global project order</span></p>
				<ul className="mt-2 space-y-2 text-xs text-muted-foreground">{commits.map(commit => <li key={commit.id} className="flex items-center gap-2"><Check size={12} aria-hidden="true" />{commit.label}</li>)}</ul>
			</div>
			<p className="mt-4 text-xs leading-6 text-muted-foreground">This in-page model applies the file-parent rule to two example files. The competing edits change the same paragraph; no text merge, hash generation, CLI, or network service runs here.</p>
		</Experiment>
	);
}
