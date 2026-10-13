import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Check, Moon, Sun, Terminal } from 'lucide-react';
import { useTheme } from 'next-themes';
import CopyButton from './CopyButton';
import { repository } from './meta';
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './jsql.css';

const Playground = lazy(() => import('./Playground'));
const install = 'binzo install darylcecile/jsql\njsql --help';
const firstQuery = `echo '[{"name":"Ada","age":36},{"name":"Lin","age":25}]' \\\n  | jsql 'SELECT name FROM data WHERE age >= 30'`;
const pipeline = `jsql 'SELECT * FROM data WHERE paid = 1' < orders.json \\\n  | jsql 'SELECT count(*) AS paid_orders FROM data'`;

function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const dark = mounted && resolvedTheme === 'dark';
	return <button type="button" className="jsql-theme" aria-label="Toggle color theme" onClick={() => setTheme(dark ? 'light' : 'dark')}>{dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}</button>;
}

function Command({ title, code, output }: { title: string; code: string; output?: string }) {
	return (
		<div className="jsql-command">
			<div className="jsql-command-title"><span><Terminal size={15} aria-hidden="true" />{title}</span><CopyButton text={code} label="Copy command" /></div>
			<pre tabIndex={0} role="group" aria-label={title}><code>{code}</code></pre>
			{output && <div className="jsql-command-output"><span>stdout</span><code>{output}</code></div>}
		</div>
	);
}

export default function Page() {
	return (
		<div className="jsql-site" id="top">
			<a className="jsql-skip" href="#playground">Skip to the playground</a>
			<header className="jsql-header jsql-container">
				<a className="jsql-logo" href="#top" aria-label="jsql home"><Braces size={25} aria-hidden="true" /><span>jsql<span className="jsql-logo-cursor">_</span></span></a>
				<nav aria-label="Main navigation"><a href="#playground">Playground</a><a href="#how-it-works">How it works</a><a href="#get-started">Get jsql</a></nav>
				<div className="jsql-header-actions"><a href={repository} className="jsql-source-link">Source <ArrowUpRight size={16} aria-hidden="true" /></a><ThemeToggle /></div>
			</header>
			<main>
				<section className="jsql-hero jsql-container" aria-labelledby="jsql-title">
					<div><p className="jsql-intro-label"><span aria-hidden="true">{`{ }`}</span> A small tool for a good question.</p><h1 id="jsql-title">Ask your JSON<br />a SQL question.</h1></div>
					<div className="jsql-hero-aside"><p>The data is already there. Filter it, add it up, find what matters. jsql turns a JSON document and a SQL query into an answer you can use.</p><div className="jsql-hero-links"><a className="jsql-button" href="#playground">Try a query <ArrowDown size={16} aria-hidden="true" /></a><a className="jsql-text-link" href="#get-started">Get the CLI <ArrowRight size={17} aria-hidden="true" /></a></div><p className="jsql-small-note">One native executable. SQLite included.</p></div>
				</section>

				<section className="jsql-playground-section jsql-container" id="playground" aria-labelledby="jsql-playground-title">
					<div className="jsql-section-heading"><h2 id="jsql-playground-title" className="jsql-flow"><span>JSON in</span><ArrowRight aria-hidden="true" /><span>SQL</span><ArrowRight aria-hidden="true" /><span>JSON out</span></h2><span className="jsql-demo-label">The browser workbench</span></div>
					<Suspense fallback={<div className="jsql-workbench-loading" role="status">Loading the editable workbench…</div>}><Playground /></Suspense>
					<details className="jsql-demo-details"><summary>About this browser demo</summary><p>This is real SQLite, compiled to WebAssembly by <a href="https://github.com/sql-js/sql.js">sql.js</a>. It adapts <a href={`${repository}/blob/c1eb8da635aabb84097d6730787d2e696afedbe3/src/bridge.c`}>jsql’s JSON mapping</a> to SQLite 3.49.1. The native CLI embeds SQLite 3.51.0 and uses a JSONB-backed view; this demo uses a JSON-text-backed view.</p><p>Each run gets a fresh, disposable browser worker. The demo accepts 256 KiB of input, 8 KiB of SQL and 128 columns; results are limited to 1,000 rows and 512 KiB. Queries stop after 3 seconds. Only the first SQL statement runs, and it must return columns. Integers are kept intact in the displayed JSON; available SQLite functions can differ from the CLI.</p></details>
				</section>

				<section className="jsql-explain jsql-container" id="how-it-works" aria-labelledby="jsql-mapping-title">
					<div className="jsql-explain-intro"><h2 id="jsql-mapping-title">There’s a table<br /> in that JSON.</h2><p>jsql calls it <code>data</code>. Each item in an array becomes a row, and object keys become columns. A single object gives you one row.</p><p>No schema file. No database server. Just a few explicit conventions.</p><a className="jsql-text-link" href={`${repository}#how-json-maps-to-sql`}>Read the mapping reference <ArrowUpRight size={16} aria-hidden="true" /></a></div>
					<dl className="jsql-mapping">
						<div><dt>Keys become columns</dt><dd><code>{'{"name":"Ada"}'}</code><ArrowRight size={17} aria-hidden="true" /><code>SELECT name FROM data</code><p>Keys are discovered across every row. Quote names with spaces or SQL keywords.</p></dd></div>
						<div><dt>Booleans become integers</dt><dd><code>true / false</code><ArrowRight size={17} aria-hidden="true" /><code>1 / 0</code><p>Use <code>WHERE paid = 1</code>. Selecting a boolean returns a number.</p></dd></div>
						<div><dt>Missing means NULL</dt><dd><code>{'{"id":1}'}</code><ArrowRight size={17} aria-hidden="true" /><code>discount IS NULL</code><p>If another row has <code>discount</code>, this row gets SQL <code>NULL</code>. Explicit JSON null maps the same way.</p></dd></div>
						<div><dt>Nested values stay JSON text</dt><dd><code>{'{"city":"Leeds"}'}</code><ArrowRight size={17} aria-hidden="true" /><code>{JSON.stringify('{"city":"Leeds"}')}</code><p>Use <code>json_extract(customer, '$.city')</code> to read inside. Selecting the whole object returns a string.</p></dd></div>
						<div><dt>Scalars use value</dt><dd><code>[3, 1, 2]</code><ArrowRight size={17} aria-hidden="true" /><code>SELECT value FROM data</code><p>An empty array returns no rows. Numbers and strings keep their types.</p></dd></div>
					</dl>
				</section>

				<section className="jsql-agent-section" id="for-agents" aria-labelledby="jsql-agent-title">
					<div className="jsql-container jsql-agent-layout">
						<div><p className="jsql-agent-label">For you. And the agent in your terminal.</p><h2 id="jsql-agent-title">Bring back the answer,<br />not the whole export.</h2><p>An agent inspecting tool results or a JSON log export can ask SQLite to do the filtering and arithmetic. Return the relevant rows, inspect the answer, and choose the next command.</p><p>The useful part is the small contract: one query argument, JSON on stdin, JSON on stdout. Errors go to stderr with exit code 1.</p></div>
						<div className="jsql-agent-example"><p className="jsql-agent-question">“How many of these orders are paid?”</p><p className="jsql-agent-caption">Save the <a href="#playground">Paid revenue sample</a> from the playground as <code>orders.json</code>, then run:</p><Command title="A two-step shell pipeline" code={pipeline} output={'[{"paid_orders":3}]'} /><p className="jsql-agent-caption">One query can count them too. The pipe shows the point: the answer is still data, ready for another command.</p></div>
						<div className="jsql-agent-footnote"><Check size={18} aria-hidden="true" /><p>Select the fields you need. Check the exit status. Let the result inform the next step.</p></div>
					</div>
				</section>

				<section className="jsql-get-started jsql-container" id="get-started" aria-labelledby="jsql-install-title">
					<div className="jsql-install-intro"><h2 id="jsql-install-title">Keep it in<br /> your toolkit.</h2><p>jsql is a small, open-source command-line tool. The native executable includes SQLite and runs without Node.js, Bun or a separate database installation.</p><a className="jsql-release" href={`${repository}/releases/tag/v0.0.1`}><span>v0.0.1</span> macOS &amp; Linux <ArrowUpRight size={16} aria-hidden="true" /></a><p className="jsql-small-note">x64 and ARM64 builds · MIT licensed</p></div>
					<div className="jsql-install-steps"><h3>Install with Binzo</h3><p>Already have <a href="https://github.com/darylcecile/binzo#readme">Binzo</a>? It picks the release for your platform.</p><Command title="Install jsql" code={install} /><p className="jsql-install-alternative">You can also <a href={`${repository}/releases/latest`}>download a release</a> or <a href={`${repository}/blob/main/CONTRIBUTING.md`}>build from source</a>.</p><h3>Ask your first question</h3><Command title="Find a name" code={firstQuery} output={'[{"name":"Ada"}]'} /></div>
				</section>

				<aside className="jsql-boundary jsql-container"><Braces size={25} aria-hidden="true" /><div><h2>One document. One question.</h2><p>jsql reads one complete JSON document, not a stream of newline-delimited records. Input is held in memory. The result reflects SQLite’s types, so <code>SELECT *</code> isn’t a lossless round-trip for booleans or nested objects.</p></div><a href={`${repository}#use`}>CLI reference <ArrowUpRight size={16} aria-hidden="true" /></a></aside>
			</main>
			<footer className="jsql-footer jsql-container"><a className="jsql-logo" href="#top"><Braces size={22} aria-hidden="true" /><span>jsql</span></a><p>A small tool by <a href="https://darylcecile.net">Daryl Cecile</a>.</p><nav aria-label="Footer navigation"><a href={`${repository}#readme`}>Documentation</a><a href={repository}>GitHub <ArrowUpRight size={14} aria-hidden="true" /></a><a href={`${repository}/blob/main/LICENSE`}>MIT license</a></nav></footer>
		</div>
	);
}
