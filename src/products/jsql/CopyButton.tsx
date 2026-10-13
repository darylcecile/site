import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
	const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
	const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(timeout.current), []);
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			setStatus('copied');
		} catch {
			setStatus('failed');
		}
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => setStatus('idle'), 3_000);
	}
	return (
		<button type="button" className="jsql-copy" onClick={copy} aria-label={label}>
			{status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
			<span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'failed' ? 'Select to copy' : label}</span>
		</button>
	);
}
