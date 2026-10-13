import { useEffect, useRef, useState } from 'react';
import { Check, Play, RotateCcw, Square, Terminal } from 'lucide-react';
import {
	createIssues, ENGINE_VERSION, examples, initialDemoState, LOAD_LIMIT, SOURCE_LIMIT, WORKER_LIMIT,
	type DemoReply, type DemoState,
} from './demo';

export default function Workbench() {
	const [selected, setSelected] = useState<(typeof examples)[number]>(examples[0]);
	const [source, setSource] = useState<string>(examples[0].source);
	const [state, setState] = useState<DemoState>(initialDemoState);
	const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout> } | null>(null);
	const busy = state.status === 'loading' || state.status === 'running';

	function terminate() {
		if (!active.current) return;
		clearTimeout(active.current.timer);
		active.current.worker.terminate();
		active.current = null;
	}

	useEffect(() => () => {
		if (!active.current) return;
		clearTimeout(active.current.timer);
		active.current.worker.terminate();
	}, []);

	function reset(example = selected) {
		terminate();
		setSelected(example);
		setSource(example.source);
		setState(initialDemoState);
	}

	function run() {
		if (active.current) return;
		if (!source.trim()) {
			setState({ status: 'error', message: 'Add some guest JavaScript before running.' });
			return;
		}
		if (typeof Worker === 'undefined') {
			setState({ status: 'error', message: 'This demo needs a browser with Web Worker support.' });
			return;
		}
		setState({ status: 'loading', message: 'Loading JSVM into a fresh worker…' });
		try {
			const worker = new Worker(new URL('./demo.worker.ts', import.meta.url), { type: 'module' });
			function fail(message: string) {
				if (active.current?.worker !== worker) return;
				terminate();
				setState({ status: 'error', message });
			}
			active.current = {
				worker,
				timer: setTimeout(() => fail('The engine did not load within 12 seconds. Try Run again.'), LOAD_LIMIT),
			};
			worker.onmessage = ({ data }: MessageEvent<DemoReply>) => {
				if (active.current?.worker !== worker) return;
				if (data.type === 'ready') {
					clearTimeout(active.current.timer);
					active.current.timer = setTimeout(() => fail('Worker terminated after 2 seconds. Simplify the code, then run again.'), WORKER_LIMIT);
					setState({ status: 'running', message: 'Interpreting guest code…' });
					worker.postMessage({ source });
					return;
				}
				terminate();
				setState({
					status: data.ok ? 'complete' : 'error',
					message: data.ok ? 'Run complete. The worker has been disposed.' : `${data.code ?? 'Error'} — the worker has been disposed.`,
					result: data,
				});
			};
			worker.onerror = () => fail('The worker could not run. Try again or check that your browser permits workers.');
			worker.onmessageerror = () => fail('The worker result could not be read. Reset the example and try again.');
		} catch (error) {
			terminate();
			setState({ status: 'error', message: error instanceof Error ? error.message : 'Could not start the demo worker.' });
		}
	}

	return (
		<section className="jsvm-workbench" id="workbench" aria-labelledby="jsvm-workbench-title">
			<div className="jsvm-workbench-heading">
				<div>
					<h2 id="jsvm-workbench-title"><Terminal size={20} aria-hidden="true" /> Execution workbench</h2>
					<p>The real runtime. Your browser. A fresh VM for every run.</p>
				</div>
				<span className="jsvm-version">JSVM {ENGINE_VERSION}</span>
			</div>
			<div className="jsvm-presets" role="group" aria-label="Guest code examples">
				{examples.map(example => (
					<button type="button" key={example.id} aria-pressed={selected.id === example.id} onClick={() => reset(example)}>
						{example.name}
					</button>
				))}
			</div>
			<p className="jsvm-example-description" id="jsvm-example-description">{selected.description}</p>
			<div className="jsvm-host-strip">
				<span className="jsvm-host-label">Host grants</span>
				<span><Check size={13} aria-hidden="true" /> 3 cloned issues</span>
				<span><Check size={13} aria-hidden="true" /> 1 local read-only tool</span>
				<span className="jsvm-denied">Network denied</span>
			</div>
			<div className="jsvm-editor-grid">
				<div className="jsvm-editor-pane">
					<div className="jsvm-pane-title"><label htmlFor="jsvm-guest-source">Guest JavaScript</label><span>{busy ? 'read-only' : 'editable'}</span></div>
					<textarea
						id="jsvm-guest-source" name="guest-code" value={source}
						onChange={event => { setSource(event.target.value); setState(initialDemoState); }}
						onKeyDown={event => {
							if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); }
						}}
						readOnly={busy} maxLength={SOURCE_LIMIT} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
						aria-describedby="jsvm-editor-help jsvm-example-description"
					/>
					<div className="jsvm-editor-actions">
						<div>
							{busy ? (
								<button type="button" className="jsvm-button jsvm-button-primary" onClick={() => {
									terminate(); setState({ status: 'stopped', message: 'Stopped. The worker was terminated; your code is still here.' });
								}}><Square size={14} aria-hidden="true" /> Stop</button>
							) : (
								<button type="button" className="jsvm-button jsvm-button-primary" onClick={run}><Play size={15} aria-hidden="true" /> Run code</button>
							)}
							<button type="button" className="jsvm-button jsvm-button-quiet" onClick={() => reset()}><RotateCcw size={14} aria-hidden="true" /> Reset</button>
						</div>
						<span id="jsvm-editor-help">⌘ / Ctrl + Enter to run</span>
					</div>
				</div>
				<div className="jsvm-result-pane" aria-busy={busy}>
					<div className="jsvm-pane-title"><h3>Host receives</h3><span>{state.result ? (state.result.ok ? 'ok: true' : 'ok: false') : 'result'}</span></div>
					<div className={`jsvm-run-status jsvm-status-${state.status}`} role="status" aria-live="polite" aria-atomic="true">
						<span className="jsvm-status-dot" aria-hidden="true" />{state.message}
					</div>
					{state.result ? (
						<pre className="jsvm-result" role="region" tabIndex={0} aria-label="Execution result"><code>{state.result.output}</code></pre>
					) : (
						<div className="jsvm-empty-result"><span aria-hidden="true">{'{ }'}</span><p>Values cross the boundary.<br />Host references don’t.</p></div>
					)}
					<div className="jsvm-call-log">
						<h4>Capability calls{state.result ? ` (${state.result.calls.length})` : ''}</h4>
						{state.result?.calls.length ? <ol>{state.result.calls.map((call, index) => <li key={index}><code>{call}</code></li>)}</ol> : <p>No host tool calls{state.result ? ' in this run' : ' yet'}.</p>}
					</div>
				</div>
			</div>
			<details className="jsvm-demo-details">
				<summary>Inspect this host configuration and its limits</summary>
				<div className="jsvm-demo-config">
					<div><h3>Cloned input: issues</h3><pre tabIndex={0}><code>{JSON.stringify(createIssues(), null, 2)}</code></pre></div>
					<div>
						<h3>What this demo grants</h3>
						<ul>
							<li><code>tools.getIssue(id)</code> reads fixtures 101–103. Eight calls maximum; no API or storage access.</li>
							<li><code>randomSeed: "issue-triage"</code>; <code>dateNow: 1760400000000</code>.</li>
							<li>No network rules, module loader or dynamic-code capability.</li>
							<li>250 ms cooperative VM guard, plus worker termination after 2 seconds of execution. Engine loading has a separate 12-second timeout.</li>
							<li>8,000 input characters; output is a depth- and size-limited preview. This is not a memory quota.</li>
						</ul>
						<p>Reset, changing an example, and Stop all terminate an active worker. Code runs locally; it is not submitted to a server.</p>
					</div>
				</div>
			</details>
		</section>
	);
}
