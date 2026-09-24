'use client';

import { useState } from 'react';
import { Experiment, experimentButton } from '../Experiment';

const steps = [
	{
		label: 'Make the fix',
		command: '# Save checkout.ts in your editor',
		localSeconds: 3,
		sharedSeconds: null,
		note: 'You changed the wait from one second to three and saved the file. Kelp has captured a checkpoint on your computer. You haven’t shared the fix yet.',
	},
	{
		label: 'Share it',
		command: 'kelp publish -m "Give checkout more time"',
		localSeconds: 3,
		sharedSeconds: 3,
		note: 'Your teammate can now see the three-second fix. Kelp remembers this piece of work as “Give checkout more time.”',
	},
	{
		label: 'Make an improvement',
		command: '# Save a five-second timeout after feedback',
		localSeconds: 5,
		sharedSeconds: 3,
		note: 'Your teammate asked for five seconds. You’ve saved that edit on your computer, but the shared version still says three. Your teammate’s copy hasn’t silently changed.',
	},
	{
		label: 'Share the update',
		command: 'kelp publish',
		localSeconds: 5,
		sharedSeconds: 5,
		note: 'Your teammate can now see the five-second version of the same fix. The earlier three-second version remains in its history, so you can still compare the two.',
	},
];

export function ChangeIdentity() {
	const [step, setStep] = useState(0);
	const current = steps[step];
	return (
		<Experiment number="02" title="What can your teammate see?" description="Follow the checkout fix from your first edit to sharing an improvement. Compare the two copies at each step." kind="Works in the prototype" onReset={() => setStep(0)}>
			<div role="group" aria-label="Steps in sharing the checkout fix" className="mb-6 flex flex-wrap gap-2">
				{steps.map((item, i) => <button key={item.label} type="button" aria-label={`Step ${i + 1}: ${item.label}`} aria-pressed={i === step} onClick={() => setStep(i)} className={`${experimentButton} ${i === step ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300' : 'text-muted-foreground'}`}><span className="mr-1.5 font-mono" aria-hidden="true">{i + 1}</span>{item.label}</button>)}
			</div>
			<div aria-live="polite" aria-atomic="true">
				<p className="mb-4 text-sm font-medium">The task: Give checkout more time</p>
				<dl className="grid gap-3 sm:grid-cols-2">
					<div className="rounded-lg border border-border p-4">
						<dt className="text-xs text-muted-foreground">On your computer</dt>
						<dd className="mt-2 text-lg font-medium">Wait {current.localSeconds} seconds</dd>
					</div>
					<div className="rounded-lg border border-border p-4">
						<dt className="text-xs text-muted-foreground">Shared with your teammate</dt>
						<dd className="mt-2 text-lg font-medium text-emerald-800 dark:text-emerald-300">{current.sharedSeconds === null ? 'Not shared yet' : `Wait ${current.sharedSeconds} seconds`}</dd>
					</div>
				</dl>
				<div className="mt-4 overflow-hidden rounded-lg border border-border">
					<p className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">checkout.ts — the file on your computer</p>
					<pre className="overflow-x-auto p-4 text-xs"><code>{`const checkoutTimeoutSeconds = ${current.localSeconds};`}</code></pre>
				</div>
				<pre className="mt-4 overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs"><code>{current.command}</code></pre>
				<p className="mt-4 min-h-24 text-sm leading-7 text-muted-foreground">{current.note}</p>
			</div>
			<div className="mt-3 flex items-center justify-between gap-3">
				<button type="button" className={experimentButton} disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous</button>
				<span className="font-mono text-xs text-muted-foreground">{step + 1} / {steps.length}</span>
				<button type="button" className={experimentButton} disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next step →</button>
			</div>
		</Experiment>
	);
}
