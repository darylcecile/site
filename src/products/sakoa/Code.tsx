import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text, label = 'Copy source' }: { text: string; label?: string }) {
	const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			setStatus('copied');
		} catch {
			setStatus('failed');
		}
	}

	return (
		<span className="sakoa-copy-wrap">
			<button className="sakoa-copy" type="button" onClick={copy} aria-label={label}>
				{status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
				<span>{status === 'copied' ? 'Copied' : 'Copy'}</span>
			</button>
			<span className={status === 'failed' ? 'sakoa-copy-error' : 'sakoa-sr-only'} role="status">
				{status === 'failed' ? 'Copy unavailable. Select the code to copy it.' : status === 'copied' ? `${label} complete.` : ''}
			</span>
		</span>
	);
}

export function Code({ source, highlighted = [], label }: { source: string; highlighted?: number[]; label: string }) {
	return (
		<pre className="sakoa-code" role="region" tabIndex={0} aria-label={label}>
			<code>{source.split('\n').map((line, index) => (
				<span key={index} className={`sakoa-code-line${highlighted.includes(index + 1) ? ' sakoa-code-highlight' : ''}`}>
					<span className="sakoa-line-number" aria-hidden="true">{index + 1}</span>
					<span>{line || '\u00a0'}{'\n'}</span>
				</span>
			))}</code>
		</pre>
	);
}
