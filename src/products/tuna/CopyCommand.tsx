import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyCommand({ command, label = 'Copy command' }: { command: string; label?: string }) {
	const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);
	async function copy() {
		clearTimeout(timer.current);
		try {
			await navigator.clipboard.writeText(command);
			setState('copied');
			timer.current = setTimeout(() => setState('idle'), 2500);
		} catch {
			setState('error');
		}
	}
	return <div className="tuna-copy">
		<div className="tuna-command"><pre><code>{command}</code></pre><button type="button" onClick={copy} aria-label={label}>{state === 'copied' ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}<span>{state === 'copied' ? 'Copied' : 'Copy'}</span></button></div>
		<span className="tuna-copy-feedback" role="status">{state === 'error' ? 'Couldn’t copy. Select the command and copy it manually.' : state === 'copied' ? 'Command copied.' : ''}</span>
	</div>;
}
