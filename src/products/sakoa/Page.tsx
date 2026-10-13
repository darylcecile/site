import { ArrowDown, ArrowUpRight, Check, ChevronRight, Code2, GitBranch, Terminal } from 'lucide-react';
import { Code, CopyButton } from './Code';
import Explorer from './Explorer';
import { repository } from './meta';
import { effectSource, sourceCommit, sourceUrl } from './specimens';
import './sakoa.css';

const installCommands = `git clone https://github.com/darylcecile/sakoa.git
cd sakoa
cargo install --path crates/sakoa-cli`;

const startCommands = `mkdir hello-sakoa
cd hello-sakoa
sakoa init hello-sakoa
sakoa check src/main.sakoa
sakoa run`;

function Wordmark() {
	return <span className="sakoa-wordmark"><span className="sakoa-mark" aria-hidden="true">s<span>_</span></span>sakoa</span>;
}

function Hero() {
	return (
		<section className="sakoa-hero" aria-labelledby="sakoa-title">
			<div className="sakoa-hero-copy">
				<p className="sakoa-version"><span aria-hidden="true" />A language taking shape</p>
				<h1 id="sakoa-title">Make intent<br />part of the<br />{' '}language.</h1>
				<p className="sakoa-lead">Sakoa brings explicit effects, visible ownership, and a shared toolchain to application and systems programming.</p>
				<p className="sakoa-hero-note">Readable by people. Predictable for the agents working alongside them.</p>
				<div className="sakoa-actions">
					<a className="sakoa-button sakoa-button-primary" href="#explorer">Explore the language <ArrowDown size={16} aria-hidden="true" /></a>
					<a className="sakoa-text-link" href="#get-started">Get started <ChevronRight size={17} aria-hidden="true" /></a>
				</div>
			</div>
			<div className="sakoa-specimen">
				<div className="sakoa-specimen-label"><Code2 size={17} aria-hidden="true" /><span>A public contract, in plain sight</span></div>
				<div className="sakoa-specimen-code">
					<div className="sakoa-pane-title"><span>configuration.sakoa</span><span>Sakoa</span></div>
					<Code source={effectSource} highlighted={[7]} label="Checked example of an explicit environment effect" />
					<div className="sakoa-checked"><Check size={15} aria-hidden="true" />Checked with Sakoa 0.1.0 <span>0 diagnostics</span></div>
				</div>
				<div className="sakoa-annotation">
					<span className="sakoa-annotation-line" aria-hidden="true" />
					<code>uses env</code>
					<p>The helper reads the environment.<br />The public signature makes that visible.</p>
				</div>
			</div>
		</section>
	);
}

function Language() {
	return (
		<section className="sakoa-section sakoa-language" id="language" aria-labelledby="sakoa-language-heading">
			<div className="sakoa-language-intro">
				<p className="sakoa-kicker">Language design, in 2026</p>
				<h2 id="sakoa-language-heading">Less guesswork<br />in the next change.</h2>
				<p>What could a purpose-built language look like when both humans and agents write the code?</p>
				<p>Sakoa explores a practical answer: make important decisions visible in the source, and give tools concrete feedback when those decisions don’t line up.</p>
				<a className="sakoa-text-link" href={`${sourceUrl}/vision.md`}>Read the language vision <ArrowUpRight size={16} aria-hidden="true" /></a>
			</div>
			<dl className="sakoa-principles">
				<div>
					<dt><code>uses</code><span>Effects cross the API boundary with you.</span></dt>
					<dd>Private helpers infer effects. Public and package-visible functions must declare the effects the checker finds, including through callees. An agent changing a helper gets feedback when it changes an API’s contract.</dd>
				</div>
				<div>
					<dt><code>lend</code><span>Borrowing is visible at the call site.</span></dt>
					<dd>A borrowed parameter requires an explicit <code>lend</code> from its caller. Mutable bindings use <code>mut</code>. Reviewers can see the handoff where it happens, and the checker can identify a missing one.</dd>
				</div>
				<div>
					<dt><code>match</code><span>Give each state a name and a branch.</span></dt>
					<dd>Tagged unions keep a state and its payload together. The checker reports missing cases for known enums, giving an agent a specific branch to address instead of an unstated assumption.</dd>
				</div>
			</dl>
		</section>
	);
}

function Toolchain() {
	return (
		<section className="sakoa-section sakoa-toolchain" id="toolchain" aria-labelledby="sakoa-toolchain-heading">
			<div className="sakoa-section-heading">
				<div><p className="sakoa-kicker">One compiler library</p><h2 id="sakoa-toolchain-heading">A shorter path<br />from edit to evidence.</h2></div>
				<p>The CLI and language server share the Rust compiler. Checking, formatting, executable tests, packages, and editor diagnostics belong to the same toolchain.</p>
			</div>
			<div className="sakoa-pipeline" role="group" aria-label="Compiler execution pipeline">
				<span><small>Your program</small><code>.sakoa</code></span><ChevronRight aria-hidden="true" />
				<span><small>Frontend</small><strong>Parse & check</strong></span><ChevronRight aria-hidden="true" />
				<span><small>Shared representation</small><strong>MIR</strong></span><ChevronRight aria-hidden="true" />
				<span><small>Execute or emit</small><code>run / test / build</code></span>
			</div>
			<div className="sakoa-toolchain-details">
				<div className="sakoa-feedback">
					<h3>A useful loop for an agent.</h3>
					<p>Check the change. Read a named diagnostic. Run the tests. Sakoa’s diagnostics have codes, source spans, and a shared explanation registry; <code>sakoa explain</code> makes the next step inspectable.</p>
					<div className="sakoa-explain"><code>$ sakoa explain E0600</code><p><strong>E0600: Missing public effect</strong><br />Public and package-visible functions must declare effects performed directly, through callees, or through function values.</p></div>
					<p>Native <code>test</code> and <code>property</code> declarations turn expected behavior into runnable checks. The test runner can emit JSON reports, and property failures include generated inputs and shrinking results.</p>
					<a className="sakoa-text-link" href={`${sourceUrl}/docs/cli.md`}>Explore the CLI <ArrowUpRight size={15} aria-hidden="true" /></a>
				</div>
				<div className="sakoa-targets">
					<h3>Choose an artifact.</h3>
					<dl>
						<div><dt>Native</dt><dd>C source + a compiled executable</dd></div>
						<div><dt>JavaScript</dt><dd>Runnable JavaScript + source map</dd></div>
						<div><dt>WebAssembly</dt><dd>WebAssembly text <code>(.wat)</code></dd></div>
						<div><dt>Embedded</dt><dd>Freestanding C + manifest</dd></div>
					</dl>
					<p>Each backend has an explicit feature contract. Unsupported constructs receive a backend diagnostic before artifact writes; host networking and threading support varies by target.</p>
					<a className="sakoa-text-link" href={`${sourceUrl}/docs/build-targets.md`}>Read the target matrix <ArrowUpRight size={15} aria-hidden="true" /></a>
				</div>
			</div>
		</section>
	);
}

function GetStarted() {
	return (
		<section className="sakoa-section sakoa-get-started" id="get-started" aria-labelledby="sakoa-start-heading">
			<div>
				<p className="sakoa-kicker">Start with the source</p>
				<h2 id="sakoa-start-heading">Your first<br /><code>.sakoa</code> file.</h2>
				<p>The current toolchain is version 0.1.0, built from source with Rust. Install <a href="https://rustup.rs/">Rust and Cargo</a>, then build the CLI and create a small package.</p>
				<p><code>init</code> creates the manifest, lockfile, and starter program in your current directory. <code>run</code> checks and executes it through the MIR interpreter.</p>
				<a className="sakoa-button sakoa-button-secondary" href={`${sourceUrl}/docs/getting-started.md`}>Read the full guide <ArrowUpRight size={16} aria-hidden="true" /></a>
			</div>
			<div className="sakoa-start-terminal">
				<div className="sakoa-pane-title"><span><Terminal size={16} aria-hidden="true" />Install the CLI</span><CopyButton text={installCommands} label="Copy installation commands" /></div>
				<pre role="region" tabIndex={0} aria-label="Installation commands"><code>{installCommands}</code></pre>
				<div className="sakoa-pane-title"><span>Create a package and run it</span><CopyButton text={startCommands} label="Copy getting started commands" /></div>
				<pre role="region" tabIndex={0} aria-label="Getting started commands"><code>{startCommands}</code></pre>
				<div className="sakoa-first-output"><Check size={15} aria-hidden="true" /><code>Hello from hello-sakoa</code></div>
			</div>
		</section>
	);
}

export default function Page() {
	return (
		<div className="sakoa-site">
			<a className="sakoa-skip" href="#sakoa-main">Skip to content</a>
			<header className="sakoa-header sakoa-container">
				<a href="/" aria-label="Sakoa home"><Wordmark /></a>
				<nav aria-label="Main navigation">
					<a href="#language">Language</a><a href="#explorer">Explorer</a><a href="#toolchain">Toolchain</a>
				</nav>
				<a className="sakoa-github" href={repository}>GitHub <ArrowUpRight size={16} aria-hidden="true" /></a>
			</header>
			<main className="sakoa-container" id="sakoa-main" tabIndex={-1}>
				<Hero /><Language /><Explorer /><Toolchain /><GetStarted />
			</main>
			<footer className="sakoa-footer sakoa-container">
				<div><a href="/" aria-label="Sakoa home"><Wordmark /></a><p>A language project by <a href="https://darylcecile.net">Daryl Cecile</a>.</p></div>
				<div className="sakoa-footer-links"><a href={`${sourceUrl}/docs/language.md`}>Language guide</a><a href={`${sourceUrl}/editors/vscode`}>Editor support</a><a href={repository}>Source on GitHub</a></div>
				<a className="sakoa-revision" href={sourceUrl}><GitBranch size={14} aria-hidden="true" />Examples checked at <code>{sourceCommit.slice(0, 7)}</code></a>
			</footer>
		</div>
	);
}
