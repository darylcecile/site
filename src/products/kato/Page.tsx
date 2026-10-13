import { ArrowDown, ArrowUpRight, Braces, Code2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource/ibm-plex-mono/400.css';
import Playground from './Playground';
import { repository } from './meta';
import './kato.css';

function Mark() {
	return <svg className="kato-mark" width="32" height="36" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M16 1 31 9.5v17L16 35 1 26.5v-17L16 1Z" fill="currentColor" /><path d="m1 9.5 15 9 15-9M16 18.5V35M8.5 5.2l15 8.8" stroke="var(--kato-paper)" strokeWidth="1.5" /></svg>;
}

function ThemeSwitch() {
	const { resolvedTheme, setTheme } = useTheme();
	return <button className="kato-theme" type="button" aria-label="Toggle color theme" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}><Moon className="kato-moon" size={18} aria-hidden="true" /><Sun className="kato-sun" size={18} aria-hidden="true" /></button>;
}

function HeroDocument() {
	return (
		<div className="kato-hero-document">
			<div className="kato-document-tab"><span className="kato-file-square" aria-hidden="true" /> a-little-clarity.kato</div>
			<div className="kato-hero-code">
				<div className="kato-code-header"><span>Kato notation</span><Braces size={20} aria-hidden="true" /></div>
				<pre role="region" aria-label="Example Kato configuration"><code><span className="kato-token-comment">{'# A small file. A clear intention.\n'}</span><span className="kato-token-meta">{'@version 1\n\n'}</span>{'assistant {\n  name: '}<span className="kato-token-string">{'"green-box"'}</span>{'\n  mode: '}<span className="kato-token-string">research</span>{'\n  timeout: '}<span className="kato-token-value">30s</span>{'\n  streaming: '}<span className="kato-token-value">on</span>{'\n}'}</code></pre>
				<div className="kato-code-annotation"><span className="kato-annotation-dot" aria-hidden="true" /><span>Braces carry structure.<br />Whitespace gets to be whitespace.</span></div>
			</div>
			<div className="kato-value-slip"><span>That <code>30s</code> has a type.</span><code>{'{ "$unit": "s", "value": 30 }'}</code></div>
		</div>
	);
}

function Notation() {
	return (
		<section className="kato-section kato-notation" id="notation" aria-labelledby="kato-notation-heading">
			<div className="kato-section-intro"><p className="kato-section-label">The notation</p><h2 id="kato-notation-heading">One obvious<br />structure.</h2><p>Kato starts with a simple rule: a document should have one obvious abstract syntax tree. A shape that people can read and tools can work with.</p><p>Use braces for objects, brackets for arrays, and a colon for a value. Commas are optional between lines. Nest things without giving indentation a second job.</p><a className="kato-text-link" href={`${repository}/blob/main/spec/DESIGN.md`}>Read the language design <ArrowUpRight size={16} aria-hidden="true" /></a></div>
			<div className="kato-comparison">
				<div className="kato-comparison-example"><div className="kato-example-label"><span>Kato</span><span>What you write</span></div><pre tabIndex={0}><code>{`server {
  host: "localhost"
  port: 3000
  enabled: on
}`}</code></pre></div>
				<div className="kato-comparison-example"><div className="kato-example-label"><span>JSON</span><span>What evaluation returns</span></div><pre tabIndex={0}><code>{`{
  "server": {
    "host": "localhost",
    "port": 3000,
    "enabled": true
  }
}`}</code></pre></div>
				<p className="kato-comparison-note">A named block becomes an object. <code>on</code> is an explicit boolean alias. No inference required.</p>
			</div>
			<div className="kato-type-intro"><h3>Values that say what they mean.</h3><p><code>yes</code> stays a string. <code>on</code> and <code>off</code> are reserved boolean aliases. A duration carries its unit instead of hiding it in a string.</p><p className="kato-small">Units are preserved, not converted or validated. The host decides what <code>s</code>, <code>MiB</code>, or a custom suffix means.</p></div>
			<div className="kato-type-table-wrap" role="region" aria-label="Kato literal types" tabIndex={0}><table className="kato-type-table"><caption className="kato-sr-only">How Kato literals evaluate in the TypeScript reference</caption><thead><tr><th scope="col">You write</th><th scope="col">You get</th><th scope="col">Value type</th></tr></thead><tbody>
				<tr><td><code>yes</code></td><td><code>"yes"</code></td><td>string</td></tr>
				<tr><td><code>on</code></td><td><code>true</code></td><td>boolean</td></tr>
				<tr><td><code>"on"</code></td><td><code>"on"</code></td><td>string</td></tr>
				<tr><td><code>42</code></td><td><code>42</code></td><td>number</td></tr>
				<tr><td><code>null</code></td><td><code>null</code></td><td>null</td></tr>
				<tr><td><code>30s</code></td><td><code>{'{ $unit: "s", value: 30 }'}</code></td><td>unit object</td></tr>
			</tbody></table></div>
		</section>
	);
}

function AgentWorkflows() {
	return (
		<section className="kato-section kato-agents" id="agents" aria-labelledby="kato-agents-heading">
			<div className="kato-agents-heading"><p className="kato-section-label">Humans & agents</p><h2 id="kato-agents-heading">Context in the file.<br />Intent in the open.</h2><p>When an agent reads, writes, or reviews a configuration, the data is only half the story. Kato gives the surrounding context a place in the document.</p></div>
			<div className="kato-agent-sheet">
				<div className="kato-example-label"><span>deployment.kato</span><span>Context for a reviewer</span></div>
				<pre tabIndex={0}><code>{`@agent {
  purpose: "Configure a deployment"
  owner: "platform-team"
  safeToEdit: ["server.timeout"]
  doNotEdit: ["database.url"]
}

server {
  /// Allow time for a slow upstream.
  timeout: 30s
}`}</code></pre>
				<div className="kato-sheet-note"><Braces size={18} aria-hidden="true" /><p><code>@agent</code> and <code>///</code> comments survive in the parsed AST. They are context for your tooling, not an enforced permissions system.</p></div>
			</div>
			<div className="kato-workflows">
				<article><h3>Configure an assistant</h3><p>Keep model choices, tool names, and time budgets in a readable file. Resolve <code>env()</code> through an explicit host-provided map; use <code>ref()</code> for a value already defined above.</p><span className="kato-workflow-foot">Working example in the playground</span></article>
				<article><h3>Make tool results readable</h3><p>Represent a result as nested data: status, matches, file paths, and a duration such as <code>240ms</code>. A host can evaluate that document into ordinary objects for the next step.</p><span className="kato-workflow-foot">An application pattern, not a protocol</span></article>
				<article className="kato-review-workflow"><div><h3>Review a concrete change</h3><p>A proposed timeout is visible in a diff. Profiles and <code>+=</code> / <code>-=</code> array operations make overlays explicit. Your application decides whether to apply them.</p></div><div className="kato-diff" role="group" aria-label="Example proposed timeout change"><code><span className="kato-diff-remove">− timeout: 30s</span><span className="kato-diff-add">+ timeout: 60s</span></code></div></article>
			</div>
		</section>
	);
}

function GetStarted() {
	return (
		<section className="kato-section kato-start" id="source" aria-labelledby="kato-start-heading">
			<div className="kato-start-intro"><p className="kato-section-label">An experiment you can inspect</p><h2 id="kato-start-heading">Start with<br />the source.</h2><p>Kato is a proof of concept. The spec is evolving, the reference parsers are in the repository, and feedback is part of the work.</p><a className="kato-button" href={repository}>Explore the repository <ArrowUpRight size={17} aria-hidden="true" /></a></div>
			<div className="kato-start-code"><div className="kato-example-label"><span>Build the TypeScript reference</span><Code2 size={17} aria-hidden="true" /></div><pre tabIndex={0}><code>{`git clone https://github.com/darylcecile/kato.git
cd kato/parsers/ts
npm install
npm run build`}</code></pre><div className="kato-example-label"><span>Use the local build from this directory</span></div><pre tabIndex={0}><code>{`import { parse, evaluate } from "./dist/index.js";

const source = "timeout: 30s";
const ast = parse(source);
const value = evaluate(source);
// { timeout: { $unit: "s", value: 30 } }`}</code></pre></div>
			<div className="kato-status-notes"><div><h3>In the reference today</h3><p>Typed ASTs, unit literals, documentation comments, <code>env()</code> / <code>ref()</code>, pluggable resolvers, profiles, and array operations. Go and TypeScript implementations, plus a VS Code extension with syntax diagnostics.</p></div><div><h3>Still taking shape</h3><p>Schema validation, include resolution, and namespace behavior appear in the language design but are not implemented by this evaluator. No published npm package or GitHub release was available at the referenced revision. The repository’s license is TBD.</p></div></div>
			<div className="kato-source-links"><a href={`${repository}/tree/main/spec`}>Language design & grammar <ArrowUpRight size={16} aria-hidden="true" /></a><a href={`${repository}/tree/main/parsers/ts`}>TypeScript reference <ArrowUpRight size={16} aria-hidden="true" /></a><a href={`${repository}/tree/main/parsers/go`}>Go reference <ArrowUpRight size={16} aria-hidden="true" /></a><a href={`${repository}/tree/main/editors/vscode`}>VS Code extension source <ArrowUpRight size={16} aria-hidden="true" /></a></div>
		</section>
	);
}

export default function KatoPage() {
	return (
		<div className="kato-site">
			<a className="kato-skip" href="#kato-main">Skip to content</a>
			<header className="kato-header kato-container"><a className="kato-wordmark" href="#top" aria-label="Kato home"><Mark /><span>kato</span></a><nav aria-label="Kato navigation"><a href="#notation">Notation</a><a href="#playground">Playground</a><a href="#agents">For agents</a><a href={repository} className="kato-nav-source">Source <ArrowUpRight size={15} aria-hidden="true" /></a></nav><ThemeSwitch /></header>
			<main id="kato-main">
				<section className="kato-hero kato-container" id="top" aria-labelledby="kato-heading"><div className="kato-hero-copy"><a className="kato-status" href={`${repository}#status`}><span aria-hidden="true" /> A notation language in the making</a><h1 id="kato-heading">Less punctuation.<br />More meaning.</h1><p>Kato is a small notation language for people and the agents working alongside them. Readable configuration. Explicit values. One obvious structure.</p><div className="kato-hero-actions"><a className="kato-button" href="#playground">Try the notation <ArrowDown size={17} aria-hidden="true" /></a><a className="kato-text-link" href="#notation">Meet Kato</a></div><p className="kato-name-note"><span lang="mfe">“Kato ver”</span> means green box in Mauritian Creole.<br />A little container for things that matter.</p></div><HeroDocument /></section>
				<div className="kato-principles kato-container"><p><code>{'{ }'}</code> Structure without indentation rules</p><p><code>30s</code> Units without string guessing</p><p><code>///</code> Documentation in the syntax tree</p></div>
				<div className="kato-container"><Notation /></div>
				<section className="kato-playground-section" id="playground" aria-labelledby="kato-playground-heading"><div className="kato-container"><div className="kato-playground-intro"><div><p className="kato-section-label">The workbench</p><h2 id="kato-playground-heading">Write it. Parse it.<br />See what it means.</h2></div><p>This is the real TypeScript reference implementation. Change a value, break a bracket, inspect the tree. The output is yours to explore.</p></div><Playground /></div></section>
				<div className="kato-container"><AgentWorkflows /><GetStarted /></div>
			</main>
			<footer className="kato-footer kato-container"><div><a className="kato-wordmark" href="#top"><Mark /><span>kato</span></a><p>A small language. An open experiment.</p></div><div className="kato-footer-links"><a href={repository}>GitHub</a><a href={`${repository}/tree/main/examples`}>Example files</a><a href="https://darylcecile.net">Made by Daryl Cecile</a></div></footer>
		</div>
	);
}
