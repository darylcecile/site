import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CircleAlert, Play, RotateCcw } from 'lucide-react';
import { examples, referenceCommit, sampleEnvironment } from './examples';
import type { DemoError, DemoResult } from './demo';
import { repository } from './meta';

const errorTitles = { parse: 'Syntax error', evaluate: 'Evaluation error', output: 'Output limit reached', runtime: 'Could not run the parser' };
const errorHelp = {
	parse: 'Edit the source and parse again. Reset restores this example.',
	evaluate: 'The syntax parsed successfully. Inspect the AST, then check the function, reference, or sample environment.',
	output: 'The document parsed, but this result is too large or deeply nested to display. Reduce the example or use the reference parser locally. Any available AST is still shown in its own view.',
	runtime: 'Try Parse again, or reload the page if the worker could not load.',
};

function ErrorDetail({ error, source }: { error: DemoError; source: string }) {
	const line = error.stage === 'parse' && Number.isSafeInteger(error.line) && error.line! > 0 ? source.split('\n')[error.line! - 1] : undefined;
	const column = line !== undefined && Number.isSafeInteger(error.column) && error.column! > 0 && error.column! <= line.length + 1 ? error.column : undefined;
	// Independently bound the UI excerpt/caret even if a worker sends bad data.
	const start = Math.max(0, (column ?? 1) - 101);
	const prefix = start ? '…' : '';
	const excerpt = line === undefined ? undefined : `${prefix}${line.slice(start, start + 200)}${line.length > start + 200 ? '…' : ''}`;
	const caret = column ? `${' '.repeat(Math.min(200, Math.max(0, column - 1 - start)) + prefix.length)}^` : undefined;
	return (
		<div className="kato-diagnostic" id="kato-error" role="alert">
			<strong><CircleAlert size={16} aria-hidden="true" /> {errorTitles[error.stage]}</strong>
			<p>{error.message}</p>
			{line !== undefined && <p>{error.atEnd ? 'Reached end of input at ' : ''}Line {error.line}{column ? `, column ${column}` : ''}</p>}
			{excerpt !== undefined && <pre><code>{caret ? `${excerpt}\n${caret}` : excerpt}</code></pre>}
			<p className="kato-error-help">{errorHelp[error.stage]}</p>
			{line === undefined && (error.stage === 'parse' || error.stage === 'evaluate') && <small>The reference implementation did not provide a source position for this error.</small>}
		</div>
	);
}

export default function Playground() {
	const [selected, setSelected] = useState(0);
	const [source, setSource] = useState<string>(examples[0].source);
	const [profile, setProfile] = useState('');
	const [view, setView] = useState<'value' | 'ast'>('value');
	const [result, setResult] = useState<DemoResult | null>(null);
	const [lastInput, setLastInput] = useState({ source: '', profile: '' });
	const [busy, setBusy] = useState(false);
	const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout> } | null>(null);

	const stop = useCallback(() => {
		if (!active.current) return;
		active.current.worker.terminate();
		clearTimeout(active.current.timer);
		active.current = null;
	}, []);

	const run = useCallback((input: string, selectedProfile: string) => {
		stop();
		setBusy(true);
		setResult(null);
		setLastInput({ source: input, profile: selectedProfile });
		const finish = (next: DemoResult) => {
			stop();
			setResult(next);
			setBusy(false);
		};
		try {
			const worker = new Worker(new URL('./demo.worker.ts', import.meta.url), { type: 'module' });
			const timer = setTimeout(() => finish({ error: { stage: 'runtime', message: 'The parser exceeded the 3-second playground limit. Try a smaller document.' } }), 3000);
			active.current = { worker, timer };
			worker.onmessage = (event: MessageEvent<DemoResult>) => finish(event.data);
			worker.onerror = () => finish({ error: { stage: 'runtime', message: 'The reference parser worker could not complete this request.' } });
			worker.postMessage({ source: input, profile: selectedProfile });
		} catch (error) {
			finish({ error: { stage: 'runtime', message: error instanceof Error ? error.message : 'A browser worker is unavailable.' } });
		}
	}, [stop]);

	useEffect(() => {
		run(examples[0].source, '');
		return stop;
	}, [run, stop]);

	function chooseExample(index: number) {
		setSelected(index);
		setSource(examples[index].source);
		setProfile('');
		run(examples[index].source, '');
	}

	function parseCurrent() {
		if (!active.current) run(source, profile);
	}

	const stale = source !== lastInput.source || profile !== lastInput.profile;
	const output = result?.[view];
	const status = busy ? 'Parsing…' : stale ? 'Edited — parse to refresh' : result?.error ? 'Needs attention' : result ? 'Parsed and evaluated' : 'Ready to parse';

	return (
		<div className="kato-workbench">
			<div className="kato-presets" role="group" aria-label="Playground examples">
				{examples.map((example, index) => <button key={example.id} type="button" aria-pressed={selected === index} onClick={() => chooseExample(index)}>{example.label}</button>)}
			</div>
			<p className="kato-preset-description">{examples[selected].description}</p>
			<div className="kato-editor-grid">
				<div className="kato-editor-pane">
					<div className="kato-pane-heading"><label htmlFor="kato-source">{examples[selected].filename}</label><span>Editable source</span></div>
					<textarea
						id="kato-source"
						name="kato-source"
						value={source}
						onChange={event => setSource(event.target.value)}
						onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); parseCurrent(); } }}
						spellCheck={false}
						autoCapitalize="off"
						autoComplete="off"
						maxLength={12000}
						wrap="off"
						aria-describedby="kato-editor-help"
						aria-invalid={!stale && result?.error?.stage === 'parse' ? true : undefined}
					/>
					<div className="kato-editor-controls">
						<div className="kato-profile-control"><label htmlFor="kato-profile">Profile</label><select id="kato-profile" value={profile} onChange={event => setProfile(event.target.value)}><option value="">Base document</option><option value="approved">approved</option></select></div>
						<div className="kato-run-controls"><button className="kato-reset" type="button" onClick={() => chooseExample(selected)}><RotateCcw size={14} aria-hidden="true" /> Reset</button><button className="kato-button kato-parse" type="button" aria-disabled={busy} onClick={parseCurrent}><Play size={14} aria-hidden="true" /> {busy ? 'Parsing…' : 'Parse'}</button></div>
					</div>
				</div>
				<div className="kato-output-pane" aria-busy={busy}>
					<div className="kato-pane-heading"><div className="kato-output-options" role="group" aria-label="Output format"><button type="button" aria-pressed={view === 'value'} onClick={() => setView('value')}>Evaluated JSON</button><button type="button" aria-pressed={view === 'ast'} onClick={() => setView('ast')}>Typed AST</button></div></div>
					<div className="kato-output-body">
						{result?.error && <ErrorDetail error={result.error} source={lastInput.source} />}
						{output ? <pre role="region" tabIndex={0} aria-label={view === 'ast' ? 'Parsed abstract syntax tree' : 'Evaluated result'} className={stale ? 'kato-output-stale' : undefined}><code>{output}</code></pre> : !result?.error && <p className="kato-output-empty">{busy ? 'Running the TypeScript reference parser…' : 'The parsed result will appear here.'}</p>}
					</div>
					<div className="kato-output-status" aria-live="polite">{!busy && !stale && result && !result.error && <Check size={14} aria-hidden="true" />}{status}</div>
				</div>
			</div>
			<div className="kato-workbench-notes">
				<p id="kato-editor-help">Runs locally in your browser. <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd> to parse. Up to 12,000 characters.</p>
				<p>{view === 'ast' ? 'AST = abstract syntax tree. The reference output includes directives and /// documentation.' : 'Values are shown as JSON; quoted strings, booleans, numbers, and unit objects remain distinct.'} Large or deeply nested outputs are limited for display.{result?.tagged && ' Non-JSON JavaScript values use explicit $jsType display tags.'}</p>
				<details><summary>Environment & reference implementation</summary><p><code>env()</code> reads only these fixed sample values. Missing names need a <code>fallback:</code> or evaluation fails. <code>ref()</code> reads earlier document values.</p><pre><code>{JSON.stringify(sampleEnvironment, null, 2)}</code></pre><p>Unmodified <a href={`${repository}/tree/${referenceCommit}/parsers/ts/src`}>TypeScript reference at {referenceCommit.slice(0, 8)}</a>. The evolving reference implementation determines what this playground accepts; it is not a schema validator.</p></details>
			</div>
		</div>
	);
}
