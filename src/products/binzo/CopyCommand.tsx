import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyCommand({ command, label = 'Copy command' }: { command: string; label?: string }) {
	const [feedback, setFeedback] = useState<{ command: string; state: 'copied' | 'failed' }>();
	const state = feedback?.command === command ? feedback.state : undefined;
	async function copy() {
		try {
			await navigator.clipboard.writeText(command);
			setFeedback({ command, state: 'copied' });
		} catch {
			setFeedback({ command, state: 'failed' });
		}
	}
	return <div className="binzo-command">
		<pre tabIndex={0} role="group" aria-label={label.replace('Copy', 'Read')}><code>{command}</code></pre>
		<button type="button" onClick={copy} aria-label={label} className="binzo-copy">
			{state === 'copied' ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
			<span>{state === 'copied' ? 'Copied' : 'Copy'}</span>
		</button>
		<span className={state === 'failed' ? 'binzo-copy-error' : 'binzo-sr-only'} role="status">{state === 'failed' ? 'Copy unavailable. Select the command and copy it manually.' : state === 'copied' ? 'Command copied to clipboard.' : ''}</span>
	</div>;
}
