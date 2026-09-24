'use client';

import { useId, useState } from 'react';
import { Experiment, experimentButton } from '../Experiment';

type GitStep = {
	label: string;
	file: number;
	staged: number;
	committed: number;
	previousCommit?: number;
	command: string;
	note: string;
};

const steps: GitStep[] = [
	{
		label: 'Starting point', file: 1, staged: 1, committed: 1,
		command: '# The original one-second setting is already committed.',
		note: 'Git has a saved record of the one-second checkout. The file you are editing and the selection for your next commit match that record.',
	},
	{
		label: 'Edit the file', file: 3, staged: 1, committed: 1,
		command: '# Change checkoutTimeoutSeconds to 3 and save the file.',
		note: 'Your editor now shows three seconds. Git’s saved history still says one. Saving in the editor does not create a commit.',
	},
	{
		label: 'Select the edit', file: 3, staged: 3, committed: 1,
		command: 'git add checkout.ts',
		note: 'You selected the three-second contents for the next commit. This selection is called the staging area. It remembers the contents at the time you ran git add.',
	},
	{
		label: 'Edit once more', file: 5, staged: 3, committed: 1,
		command: '# Change checkoutTimeoutSeconds to 5 and save again.',
		note: 'Now there are three versions to keep track of: five seconds in your editor, three selected for the next commit, and one in the latest saved commit. Tests run from your folder would see five seconds.',
	},
	{
		label: 'Make a commit', file: 5, staged: 3, committed: 3, previousCommit: 1,
		command: 'git commit -m "Give checkout more time"',
		note: 'The commit records three seconds, because that is what you selected. Your editor still shows five. Git has done exactly what you asked, but the saved commit differs from the file you just tested.',
	},
	{
		label: 'Include the new edit', file: 5, staged: 5, committed: 5, previousCommit: 3,
		command: 'git add checkout.ts\ngit commit -m "Allow five seconds"',
		note: 'Selecting the file again includes the five-second edit. The new commit records it, while the earlier one-second and three-second commits remain in the history.',
	},
];

function DiffLine({ seconds, change = 'unchanged' }: { seconds: number; change?: 'added' | 'removed' | 'unchanged' }) {
	const styles = {
		added: 'bg-emerald-500/10 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200',
		removed: 'bg-rose-500/10 text-rose-900 dark:bg-rose-400/10 dark:text-rose-200',
		unchanged: 'text-foreground',
	};
	const Tag = change === 'added' ? 'ins' : change === 'removed' ? 'del' : 'span';
	return (
		<Tag className={`flex items-baseline gap-3 px-3 py-2 no-underline ${styles[change]}`}>
			<span className="w-3 shrink-0 select-none text-right" aria-hidden="true">1</span>
			<span className="w-2 shrink-0 select-none" aria-hidden="true">{change === 'added' ? '+' : change === 'removed' ? '−' : ' '}</span>
			{change !== 'unchanged' && <span className="sr-only">{change === 'added' ? 'Added: ' : 'Removed: '}</span>}
			<span>const checkoutTimeoutSeconds = <span className={change === 'unchanged' ? '' : 'rounded bg-current/10 px-0.5 font-semibold'}>{seconds}</span>;</span>
		</Tag>
	);
}

function TimeoutDiff({ title, comparison, before, after }: {
	title: string;
	comparison: string;
	before?: number;
	after: number;
}) {
	const id = useId();
	const changed = before !== undefined && before !== after;
	return (
		<figure className="overflow-hidden rounded-lg border border-border">
			<figcaption className="border-b border-border bg-muted/30 px-4 py-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span id={id} className="text-sm font-medium">{title}</span>
					<span className="font-mono text-xs text-muted-foreground">checkout.ts</span>
				</div>
				<p className="mt-1 text-xs text-muted-foreground">{comparison}</p>
			</figcaption>
			<div role="region" aria-labelledby={id} tabIndex={0} className="overflow-x-auto py-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600">
				<code className="block min-w-max whitespace-pre font-mono text-xs leading-6">
					{changed && <DiffLine seconds={before} change="removed" />}
					<DiffLine seconds={after} change={changed ? 'added' : 'unchanged'} />
				</code>
			</div>
			{!changed && <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{before === undefined ? 'Starting snapshot' : 'No differences'}</p>}
		</figure>
	);
}

export function GitSnapshots() {
	const [step, setStep] = useState(0);
	const current = steps[step];
	return (
		<Experiment number="01" title="Which version did Git save?" description="Follow one file through editing, selecting, and committing. Notice what happens if you edit again after selecting it." kind="How Git works" onReset={() => setStep(0)}>
			<div role="group" aria-label="Git save steps" className="mb-5 flex flex-wrap gap-2">
				{steps.map((item, index) => <button key={item.label} type="button" className={`${experimentButton} ${index === step ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300' : ''}`} aria-pressed={index === step} onClick={() => setStep(index)}>{index + 1}. {item.label}</button>)}
			</div>
			<div aria-live="polite" aria-atomic="true">
				<p className="mb-3 text-xs text-muted-foreground">− Removed line · + Added line · Highlighted numbers show what changed.</p>
				<div className="grid gap-4">
					<TimeoutDiff title="In your editor" comparison="Edits since you last selected the file (git diff)." before={current.staged} after={current.file} />
					<TimeoutDiff title="Selected for a commit" comparison="Selected changes since the latest commit (git diff --staged)." before={current.committed} after={current.staged} />
					<TimeoutDiff title="Latest saved commit" comparison={current.previousCommit === undefined ? 'The original one-second setting, already saved in Git.' : 'What this commit changed from the previous saved version.'} before={current.previousCommit} after={current.committed} />
				</div>
				<pre className="mt-4 overflow-x-auto rounded-lg bg-muted/40 p-4 text-xs"><code>{current.command}</code></pre>
				<p className="mt-4 min-h-28 text-sm leading-7 text-muted-foreground">{current.note}</p>
			</div>
			<div className="mt-3 flex items-center justify-between gap-3">
				<button type="button" className={experimentButton} disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous Git step</button>
				<span className="text-xs text-muted-foreground">{step + 1} / {steps.length}</span>
				<button type="button" className={experimentButton} disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next Git step →</button>
			</div>
		</Experiment>
	);
}
