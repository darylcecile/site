import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, Play, RotateCcw, Square } from 'lucide-react';
import CopyButton from './CopyButton';
import { examples } from './examples';
import { limits, type QueryResult } from './query-contract';

type Status = 'idle' | 'loading' | 'running' | 'success' | 'error' | 'stopped';

export default function Playground() {
	const [exampleId, setExampleId] = useState<string>(examples[0].id);
	const [input, setInput] = useState<string>(examples[0].input);
	const [sql, setSql] = useState<string>(examples[0].sql);
	const [status, setStatus] = useState<Status>('idle');
	const [result, setResult] = useState<QueryResult | null>(null);
	const [error, setError] = useState('');
	const cancel = useRef<(() => void) | undefined>(undefined);
	const generation = useRef(0);
	const example = examples.find(item => item.id === exampleId) ?? examples[0];
	const busy = status === 'loading' || status === 'running';

	useEffect(() => () => {
		generation.current++;
		cancel.current?.();
	}, []);

	function stop() {
		generation.current++;
		cancel.current?.();
		cancel.current = undefined;
	}

	function clearResult() {
		setResult(null);
		setError('');
		setStatus('idle');
	}

	function loadExample(id: string) {
		const next = examples.find(item => item.id === id) ?? examples[0];
		stop();
		setExampleId(next.id);
		setInput(next.input);
		setSql(next.sql);
		clearResult();
	}

	async function run() {
		if (busy) return;
		stop();
		const current = generation.current;
		setStatus('loading');
		setError('');
		setResult(null);
		try {
			const { startQuery } = await import('./query-client');
			if (current !== generation.current) return;
			cancel.current = startQuery({ input, sql }, {
				onRunning: () => setStatus('running'),
				onResult: value => { setResult(value); setStatus('success'); },
				onError: message => { setError(message); setStatus('error'); },
			});
		} catch (cause) {
			if (current !== generation.current) return;
			setError(cause instanceof Error ? cause.message : 'The playground could not load. Run the query again.');
			setStatus('error');
		}
	}

	function handleShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			void run();
		}
	}

	const statusText = {
		idle: 'Ready when you are',
		loading: 'Loading browser SQLite…',
		running: 'Running query…',
		success: `${result?.rowCount ?? 0} ${(result?.rowCount ?? 0) === 1 ? 'row' : 'rows'} returned`,
		error: 'Query needs a correction',
		stopped: 'Stopped. Your input is still here.',
	}[status];

	return (
		<div className="jsql-workbench">
			<div className="jsql-example-bar">
				<label htmlFor="jsql-example">Start with a question</label>
				<select id="jsql-example" name="example" value={exampleId} onChange={event => loadExample(event.target.value)}>
					{examples.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
				</select>
				<span className="jsql-local"><span aria-hidden="true" /> Runs in your browser</span>
			</div>
			<p className="jsql-question">{example.question}</p>
			<div className="jsql-editor-grid">
				<div className="jsql-input-pane">
					<div className="jsql-pane-heading"><label htmlFor="jsql-json">JSON input</label><span>available as <code>data</code></span></div>
					<textarea
						id="jsql-json" name="json" autoComplete="off" className="jsql-json-editor" value={input} disabled={busy}
						onChange={event => { setInput(event.target.value); clearResult(); }}
						onKeyDown={handleShortcut} spellCheck={false} autoCapitalize="off" autoCorrect="off"
						aria-describedby="jsql-input-help" maxLength={limits.inputBytes}
					/>
					<p className="jsql-editor-help" id="jsql-input-help">Edit the sample or paste one JSON document.</p>
				</div>
				<div className="jsql-query-pane">
					<div className="jsql-pane-heading"><label htmlFor="jsql-sql">SQL query</label><span>SQLite syntax</span></div>
					<textarea
						id="jsql-sql" name="sql" autoComplete="off" className="jsql-sql-editor" value={sql} disabled={busy}
						onChange={event => { setSql(event.target.value); clearResult(); }}
						onKeyDown={handleShortcut} spellCheck={false} autoCapitalize="off" autoCorrect="off"
						aria-describedby="jsql-query-help" maxLength={limits.sqlBytes}
					/>
					<div className="jsql-run-bar">
						{busy ? (
							<button type="button" className="jsql-button jsql-run" onClick={() => { stop(); setStatus('stopped'); }}><Square size={14} aria-hidden="true" /> Stop query</button>
						) : (
							<button type="button" className="jsql-button jsql-run" onClick={() => void run()}><Play size={15} aria-hidden="true" /> Run query</button>
						)}
						<span className="jsql-shortcut" id="jsql-query-help">⌘ / Ctrl + Enter</span>
						<button type="button" className="jsql-reset" onClick={() => loadExample(exampleId)}><RotateCcw size={14} aria-hidden="true" /> Reset</button>
					</div>
					<div className="jsql-result-heading"><span><ArrowDown size={14} aria-hidden="true" /> JSON result</span>{result && <CopyButton text={result.output} label="Copy result" />}</div>
					<div className="jsql-result-pane" aria-busy={busy}>
						{result ? (
							<pre tabIndex={0} role="group" aria-label="JSON query result"><code>{result.output}</code></pre>
						) : error ? (
							<div className="jsql-query-error" role="alert"><strong>SQLite couldn’t complete that query.</strong><p>{error}</p><span>Edit your input or query, then run it again.</span></div>
						) : (
							<p className="jsql-result-empty">{busy ? 'SQLite is working on your question.' : 'Run the query. The answer will appear here as JSON.'}</p>
						)}
					</div>
				</div>
			</div>
			<div className="jsql-workbench-status"><span role="status" className={status === 'success' ? 'jsql-success' : ''}>{statusText}</span><span>{result ? `Browser SQLite ${result.sqliteVersion}` : 'No data is sent to a server'}</span></div>
			<p className="jsql-example-note">{example.note}</p>
		</div>
	);
}
