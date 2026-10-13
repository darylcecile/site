import { ArrowDown, ArrowUpRight, Braces, Check, Copy, Github, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/geist-mono';
import Workbench from './Workbench';
import { repository } from './meta';
import './styles.css';

const quickStart = `import { VM } from "@catmint-fs/jsvm";

const vm = new VM({
  capabilities: {
    executionRules: { timeLimit: 250 },
    numbers: { randomSeed: "triage", dateNow: 1760400000000 }
  },
  globals: { issues: [{ id: 101, priority: "high" }] }
});

await vm.start();
try {
  const result = await vm.eval(
    'issues.filter(issue => issue.priority === "high")'
  );
  if (result.ok) console.log(result.value);
  else console.error(result.error.code, result.error.message);
} finally {
  vm.dispose();
}`;

function CopyButton({ value, label }: { value: string; label: string }) {
	const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
	return <>
		<button type="button" className="jsvm-copy" aria-label={label} onClick={async () => {
			try { await navigator.clipboard.writeText(value); setStatus('copied'); }
			catch { setStatus('failed'); }
		}}>{status === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}<span>{status === 'copied' ? 'Copied' : status === 'failed' ? 'Select to copy' : 'Copy'}</span></button>
		<span className="jsvm-sr-only" role="status">{status === 'copied' ? 'Copied to clipboard.' : status === 'failed' ? 'Clipboard unavailable. Select and copy the code manually.' : ''}</span>
	</>;
}

export default function Page() {
	return (
		<div className="jsvm-page" id="top">
			<a className="jsvm-skip" href="#jsvm-main">Skip to content</a>
			<header className="jsvm-nav jsvm-container">
				<a className="jsvm-wordmark" href="#top" aria-label="JSVM home"><span className="jsvm-logo" aria-hidden="true"><Braces size={23} /></span>jsvm<span className="jsvm-release">0.2.0</span></a>
				<nav aria-label="JSVM navigation">
					<a href="#workbench">Workbench</a>
					<a href="#how-it-works">The boundary</a>
					<a href={`${repository}#readme`} className="jsvm-nav-docs">Docs</a>
					<a href={repository} className="jsvm-source-link" aria-label="JSVM source on GitHub"><Github size={17} aria-hidden="true" /><span>Source</span></a>
				</nav>
			</header>
			<main id="jsvm-main" className="jsvm-container">
				<section className="jsvm-hero" aria-labelledby="jsvm-title">
					<div className="jsvm-hero-copy">
						<p className="jsvm-product-kind">A JavaScript virtual machine, written in JavaScript.</p>
						<h1 id="jsvm-title">Let the code run.<br />Define its world.</h1>
						<p className="jsvm-intro">Your agent can write the logic. Your application decides what it can touch. JSVM interprets guest JavaScript behind an explicit, capability-based boundary.</p>
						<div className="jsvm-hero-actions">
							<a className="jsvm-button jsvm-button-primary" href="#workbench">Try the workbench <ArrowDown size={16} aria-hidden="true" /></a>
							<a className="jsvm-text-link" href="#get-started">Put it in your app <ArrowUpRight size={16} aria-hidden="true" /></a>
						</div>
					</div>
					<div className="jsvm-boundary-sketch" role="img" aria-label="Your application gives the guest VM copied data and explicit tools; the VM returns copied results.">
						<div className="jsvm-sketch-host"><span>Your application</span><LockKeyhole size={17} aria-hidden="true" /></div>
						<div className="jsvm-sketch-input"><span>data</span><span>tools</span><span>policy</span></div>
						<div className="jsvm-sketch-boundary"><span>Explicit boundary</span></div>
						<div className="jsvm-sketch-guest"><Braces size={36} aria-hidden="true" /><strong>Guest VM</strong><code>agent-authored.js</code></div>
						<div className="jsvm-sketch-output"><span aria-hidden="true">↓</span> A result, copied back.</div>
					</div>
				</section>
				<Workbench />
				<p className="jsvm-workbench-note">An early interpreter, with an intentionally supported subset of JavaScript. <a href="#runtime-limits">Know the boundaries before you build.</a></p>
				<section className="jsvm-workflow jsvm-section" id="for-agents" aria-labelledby="jsvm-agents-title">
					<div className="jsvm-section-intro">
						<p className="jsvm-section-label">For agent-built workflows</p>
						<h2 id="jsvm-agents-title">Give generated code<br />a smaller world.</h2>
						<p>Sometimes an agent needs a loop, a filter, or a little decision logic. JSVM gives that code a place to run without handing it your application’s ambient context.</p>
					</div>
					<ol className="jsvm-workflow-steps">
						<li><span className="jsvm-step-number">1</span><div><h3>Describe the available world</h3><p>Pass in the records to transform. Add narrow host functions for the specific operations you want to allow. Arguments and results are copied across the boundary.</p><code>globals: {'{ issues, tools: { getIssue } }'}</code></div></li>
						<li><span className="jsvm-step-number">2</span><div><h3>Let the agent supply the logic</h3><p>Run a triage rule, rank a retrieved shortlist, or reshape tool output. Guest source is parsed with Acorn and evaluated by JSVM’s own interpreter.</p><code>await vm.eval(agentGeneratedSource)</code></div></li>
						<li><span className="jsvm-step-number">3</span><div><h3>Bring back data you can inspect</h3><p>Handle the structured result in your app. Validate a proposed action before your host performs it. Pin the seed and clock to reproduce number- and time-dependent examples.</p><code>{'{ ok: true, value: … }'}</code></div></li>
					</ol>
				</section>
				<section className="jsvm-architecture jsvm-section" id="how-it-works" aria-labelledby="jsvm-boundary-title">
					<div className="jsvm-section-intro"><p className="jsvm-section-label">The execution model</p><h2 id="jsvm-boundary-title">An interpreter.<br />An explicit boundary.</h2><p>Guest source never runs through host <code>eval</code> or the host <code>Function</code> constructor. JSVM owns the guest environments and evaluates the supported syntax itself.</p></div>
					<div className="jsvm-boundary-explanation">
						<div className="jsvm-pipeline" role="img" aria-label="Guest source is parsed by Acorn, evaluated by the interpreter, then serialized as a result"><span>Guest source</span><span aria-hidden="true">↓</span><span>Acorn AST</span><span aria-hidden="true">↓</span><strong>JSVM interpreter</strong><span aria-hidden="true">↓</span><span>Serialized result</span></div>
						<dl>
							<div><dt>Copy values, not references</dt><dd>Inputs, capability calls and results are serialized and reconstructed. Mutating a guest copy doesn’t mutate the original host object.</dd></div>
							<div><dt>Make access explicit</dt><dd>Host functions become capabilities. Network requests must match declared rules; module dependencies need an explicit loader. Both default to deny.</dd></div>
							<div><dt>Control the useful variables</dt><dd>Seed <code>Math.random()</code> and fix <code>Date.now()</code>. These controls help repeat examples; they are not a deterministic event loop.</dd></div>
						</dl>
					</div>
				</section>
				<section className="jsvm-limits" id="runtime-limits" aria-labelledby="jsvm-limits-title">
					<div><p className="jsvm-section-label">Current scope</p><h2 id="jsvm-limits-title">Know what you’re running.</h2><p>JSVM is an early implementation. Use its capability boundary alongside the worker, process or OS isolation your application needs.</p><a href={`${repository}#supported-javascript-subset`} className="jsvm-text-link">Read the supported subset <ArrowUpRight size={15} aria-hidden="true" /></a></div>
					<dl>
						<div><dt>JavaScript support</dt><dd>Common control flow, functions, classes and VM-owned built-ins. Not full ECMAScript conformance or a complete browser environment.</dd></div>
						<div><dt>Resource guardrails</dt><dd>Time limits are checked cooperatively. No independent memory quota or hard CPU preemption; a blocking host capability can outlast the VM guard.</dd></div>
						<div><dt>Modules and async</dt><dd>Explicit module loaders and basic async/await. No dynamic import, cyclic module graphs, guest Promise constructor or managed event loop.</dd></div>
						<div><dt>Browser use</dt><dd>This workbench runs the published package in a worker. Upstream does not yet provide a dedicated browser compatibility matrix.</dd></div>
					</dl>
				</section>
				<section className="jsvm-get-started jsvm-section" id="get-started" aria-labelledby="jsvm-start-title">
					<div className="jsvm-section-intro"><p className="jsvm-section-label">Start with a small world</p><h2 id="jsvm-start-title">A VM you configure.<br />A result you handle.</h2><p>Install the ESM package, start a VM, and evaluate a string of guest source. Dispose it when you’re done.</p><div className="jsvm-install"><code>npm install @catmint-fs/jsvm</code><CopyButton value="npm install @catmint-fs/jsvm" label="Copy npm install command" /></div><p className="jsvm-install-alternative">Using Bun? <code>bun add @catmint-fs/jsvm</code></p><div className="jsvm-doc-links"><a href={`${repository}#public-api`}>API reference <ArrowUpRight size={15} aria-hidden="true" /></a><a href={`${repository}#security-model`}>Security model <ArrowUpRight size={15} aria-hidden="true" /></a><a href="https://www.npmjs.com/package/@catmint-fs/jsvm">Package on npm <ArrowUpRight size={15} aria-hidden="true" /></a></div></div>
					<div className="jsvm-quickstart"><div className="jsvm-pane-title"><span>host.ts</span><CopyButton value={quickStart} label="Copy quick start code" /></div><pre role="region" tabIndex={0} aria-label="JSVM quick start TypeScript"><code>{quickStart}</code></pre><p>In a browser, move evaluation into a disposable worker, as the workbench does.</p></div>
				</section>
			</main>
			<footer className="jsvm-footer jsvm-container"><a className="jsvm-wordmark" href="#top"><Braces size={22} aria-hidden="true" />jsvm</a><p>An open-source experiment by <a href="https://darylcecile.net">Daryl Cecile</a>.</p><div><a href={`${repository}/blob/main/package.json`}>MIT licensed</a><a href={repository}>Build with it <Github size={15} aria-hidden="true" /></a></div></footer>
		</div>
	);
}
