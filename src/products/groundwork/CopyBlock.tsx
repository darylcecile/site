import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type CopyBlockProps = { text: string; label?: string; code?: boolean; scrollable?: boolean };

export default function CopyBlock({ text, label = 'Copy command', code = true, scrollable = false }: CopyBlockProps) {
	const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			setState('copied');
		} catch {
			setState('failed');
		}
	}
	return (
		<div className={`gw-copy-block${code ? (scrollable ? '' : ' gw-copy-command') : ' gw-copy-prose'}`}>
			<div
				className="gw-copy-content"
				tabIndex={scrollable ? 0 : undefined}
				role={scrollable ? 'region' : undefined}
				aria-label={scrollable ? 'Example source code' : undefined}
			>
				{code ? (
					<pre tabIndex={scrollable ? undefined : 0} role={scrollable ? undefined : 'group'} aria-label={scrollable ? undefined : label.replace(/^Copy /, '')}>
						<code>{text}</code>
					</pre>
				) : <p>{text}</p>}
			</div>
			<button className="gw-copy-button" type="button" onClick={copy} aria-label={label}>
				{state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
				<span>{state === 'copied' ? 'Copied' : 'Copy'}</span>
			</button>
			<span className={`gw-copy-feedback${state === 'failed' ? ' gw-copy-error' : ''}`} role="status">
				{state === 'failed' ? 'Clipboard unavailable. Select the text to copy it manually, or try Copy again.' : state === 'copied' ? 'Copied to clipboard.' : ''}
			</span>
		</div>
	);
}
