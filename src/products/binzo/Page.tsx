import { useEffect, useRef, useState, type ComponentType } from 'react';
import { ArrowDown, ArrowDownToLine, ArrowUpRight, FileArchive, Moon, PackageOpen, Sun, Terminal } from 'lucide-react';
import { useTheme } from 'next-themes';
import CopyCommand from './CopyCommand';
import { repository } from './meta';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './binzo.css';

function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const dark = mounted && resolvedTheme === 'dark';
	return <button type="button" className="binzo-theme" aria-label="Toggle color theme" onClick={() => setTheme(dark ? 'light' : 'dark')}>{dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}</button>;
}

function ReleaseMatcher() {
	const [Matcher, setMatcher] = useState<ComponentType>();
	const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
	const content = useRef<HTMLDivElement>(null);
	const opener = useRef<HTMLButtonElement>(null);
	const focusAfterLoad = useRef(false);
	useEffect(() => {
		if (!Matcher || !focusAfterLoad.current) return;
		focusAfterLoad.current = false;
		// Removing the focused opener leaves focus on body. Respect any newer focus.
		if (document.activeElement === document.body) content.current?.querySelector('select')?.focus({ preventScroll: true });
	}, [Matcher]);
	async function open() {
		if (state === 'loading') return;
		if (state === 'error') {
			window.location.reload();
			return;
		}
		focusAfterLoad.current = document.activeElement === opener.current;
		setState('loading');
		try {
			const module = await import('./Matcher');
			focusAfterLoad.current = focusAfterLoad.current && document.activeElement === opener.current;
			setMatcher(() => module.default);
		} catch {
			focusAfterLoad.current = false;
			setState('error');
		}
	}
	return <div ref={content}>
		{Matcher ? <Matcher /> : <div className="binzo-matcher-start">
			<div className="binzo-start-files" aria-hidden="true"><FileArchive size={26} /><code>tuna_darwin_arm64</code><code>tuna_linux_amd64</code><span>…which one fits?</span></div>
			<div><h3>Pick a machine. Inspect the match.</h3><p>Try Tuna and Binzo’s recorded releases. Change the OS, CPU and Linux libc to see what gets selected—and when Binzo needs a choice.</p><button ref={opener} type="button" className="binzo-button" aria-disabled={state === 'loading'} onBlur={() => { focusAfterLoad.current = false; }} onClick={open}>{state === 'loading' ? 'Loading matcher…' : state === 'error' ? 'Reload to retry' : 'Open release matcher'}<ArrowDown size={17} aria-hidden="true" /></button><p className="binzo-start-status" role="status">{state === 'error' ? 'The matcher could not load. Check your connection, then reload to retry.' : 'Runs locally in your browser. No downloads or installs.'}</p></div>
		</div>}
	</div>;
}

export default function Page() {
	return <div className="binzo-site" id="top">
		<a className="binzo-skip" href="#main">Skip to content</a>
		<div className="binzo-opening">
			<header className="binzo-header binzo-container">
				<a className="binzo-wordmark" href="#top" aria-label="Binzo home"><PackageOpen size={29} strokeWidth={1.8} aria-hidden="true" />binzo</a>
				<nav aria-label="Main navigation"><a href="#matcher">Try the matcher</a><a href="#install">Install</a><a href="#updates">Updates</a></nav>
				<div className="binzo-header-actions"><a href={repository}>GitHub <ArrowUpRight size={16} aria-hidden="true" /></a><ThemeToggle /></div>
			</header>
		</div>
		<main id="main">
			<div className="binzo-opening">
				<section className="binzo-hero binzo-container" aria-labelledby="binzo-title">
					<div className="binzo-hero-copy"><h1 id="binzo-title">From a release<br />to your terminal.</h1><p className="binzo-lede">Install command-line tools straight from their release downloads. Binzo finds the file for your machine, puts the command on your PATH, and remembers how to update it.</p><a className="binzo-button" href="#install">Get Binzo<ArrowDownToLine size={18} aria-hidden="true" /></a><a className="binzo-hero-secondary" href="#matcher">See how it chooses</a><p className="binzo-platforms">macOS, Linux &amp; Windows. x64 &amp; ARM64.</p></div>
					<div className="binzo-release-route" role="group" aria-label="Example: from a jsql release to a command on an Apple Silicon Mac">
						<div className="binzo-route-heading"><span>A release becomes a command</span><span className="binzo-route-tag">macOS / ARM64</span></div>
						<div className="binzo-route-row"><span className="binzo-route-number">1</span><div><span>Start with a repository</span><code>binzo add darylcecile/jsql</code></div></div>
						<div className="binzo-route-row"><span className="binzo-route-number">2</span><div><span>Match the uploaded asset</span><code>jsql-macos-arm64.tar.gz</code><small>From the recorded v0.0.1 release</small></div><FileArchive className="binzo-route-icon" size={24} aria-hidden="true" /></div>
						<div className="binzo-route-row"><span className="binzo-route-number">3</span><div><span>Unpack, inspect, link</span><code>~/.binzo/bin/jsql</code></div></div>
						<div className="binzo-route-command"><Terminal size={20} aria-hidden="true" /><span>Then run</span><code>jsql --help</code></div>
					</div>
				</section>
			</div>
		<div className="binzo-body">
			<section className="binzo-section binzo-container" id="matcher" aria-labelledby="binzo-matcher-title">
				<div className="binzo-section-head"><div><p className="binzo-section-label">The release matcher</p><h2 id="binzo-matcher-title">The right file is in there.</h2></div><p>Release names vary. Binzo recognizes platform aliases, filters recognized metadata filenames, and asks when more than one download fits.</p></div>
				<ReleaseMatcher />
			</section>

			<section className="binzo-install-section" id="install" aria-labelledby="binzo-install-title">
				<div className="binzo-container binzo-install-layout"><div><p className="binzo-section-label">Get started</p><h2 id="binzo-install-title">One tool for<br />the tools you use.</h2><p>Install Binzo with npm, then give it a GitHub repository. No package definition needed.</p><a className="binzo-text-link" href={`${repository}/releases/tag/v0.0.3`}>Binzo v0.0.3 release <ArrowUpRight size={16} aria-hidden="true" /></a><p className="binzo-small">Latest checked 13 October 2026.</p></div>
					<ol className="binzo-install-steps"><li><h3>Install Binzo</h3><CopyCommand command="npm install --global binzo-cli" label="Copy Binzo installation command" /><p>Requires Node.js 20 or newer for npm installation. npm selects the native binary; running Binzo needs no Node launcher or Bun installation.</p></li><li><h3>Add a command-line tool</h3><CopyCommand command="binzo add darylcecile/jsql" label="Copy jsql installation command" /><p>For example, <a href="https://jsql.darylcecile.net">jsql</a> on macOS or Linux. <code>add</code> and <code>install</code> are aliases. Without a tag, Binzo uses GitHub’s latest stable release.</p></li><li><h3>Make it available in your terminal</h3><p>Binzo configures zsh, bash, fish or the Windows user PATH. Follow the printed instruction to enable it in your current terminal, then try <code>jsql --help</code>.</p><p className="binzo-small">Prefer manual shell setup? Add <code>--no-modify-path</code>. An installer cannot change its parent terminal’s environment.</p></li></ol>
				</div>
			</section>

			<section className="binzo-section binzo-container binzo-updates" id="updates" aria-labelledby="binzo-updates-title">
				<div className="binzo-section-head"><div><p className="binzo-section-label">After the first install</p><h2 id="binzo-updates-title">Keep the command.<br />Change the version.</h2></div><p>Binzo tracks the repository, release, asset and executable. Updates reuse your chosen variant when it can be identified unambiguously.</p></div>
				<div className="binzo-update-layout"><div className="binzo-update-commands"><div><h3>See what you installed</h3><CopyCommand command="binzo list" /></div><div><h3>Update one tool, or all of them</h3><CopyCommand command={'binzo update darylcecile/jsql\nbinzo update --all'} label="Copy update commands" /></div><div><h3>Choose a particular release</h3><CopyCommand command="binzo install darylcecile/jsql@v0.0.1" label="Copy exact release command" /></div></div><aside className="binzo-version-note"><span className="binzo-tag-symbol" aria-hidden="true">@</span><h3>A tag selects a version.<br />It doesn’t pin updates.</h3><p>Installing <code>@v0.0.1</code> starts with that exact release. Both a normal update and <code>update --all</code> still move tagged installations to latest.</p><p>To switch an installed tool to a specific release, include the tag in the update:</p><CopyCommand command="binzo update darylcecile/jsql@v0.0.1" label="Copy version switch command" /><p className="binzo-small">Use the full published tag, including its leading <code>v</code>. An explicit tag can select a prerelease too.</p></aside></div>
			</section>

			<section className="binzo-agent-section" id="agents" aria-labelledby="binzo-agents-title"><div className="binzo-container binzo-agent-layout"><div><p className="binzo-section-label">For the agent in your terminal</p><h2 id="binzo-agents-title">Give a task<br />the tool it needs.</h2><p>An agent working with a JSON export can install jsql, query the file, and continue with the result. The same installation contract works in a bootstrap script or CI job.</p><p>Choose a release, disable menus, inspect the exit status. If a choice is ambiguous, Binzo reports the available options instead of waiting for input.</p></div><div className="binzo-agent-example"><div className="binzo-agent-caption"><Terminal size={19} aria-hidden="true" /><span>Bootstrap jsql on a matching macOS or Linux machine</span></div><CopyCommand command={'binzo add darylcecile/jsql@v0.0.1 --no-interactive --json\nbinzo list --json'} label="Copy agent bootstrap commands" /><dl><div><dt><code>--json</code></dt><dd>Newline-delimited events on stdout, errors on stderr. Menus and terminal styling are disabled.</dd></div><div><dt><code>--asset</code></dt><dd>An exact uploaded filename when the release has more than one matching variant.</dd></div><div><dt><code>--binary</code></dt><dd>A relative path inside the archive when it contains more than one executable.</dd></div></dl><p className="binzo-small">This example selects the initial version. Keep the explicit tag in your setup script; future update commands still default to latest.</p></div></div></section>

			<section className="binzo-section binzo-container binzo-underneath" aria-labelledby="binzo-underneath-title"><div><p className="binzo-section-label">What happens underneath</p><h2 id="binzo-underneath-title">A place for the files.<br />A record of the choices.</h2><p>Binzo checks the download’s size and GitHub’s SHA-256 digest when provided. It looks for executable headers or a Unix shebang, and keeps supporting files alongside the command.</p><div className="binzo-store"><code>~/.binzo/</code><dl><div><dt>packages/</dt><dd>Installations and support files</dd></div><div><dt>bin/</dt><dd>Commands exposed on PATH</dd></div><div><dt>installed.json</dt><dd>Release and executable tracking</dd></div></dl></div></div><div className="binzo-details-list"><details open><summary>Updates prepare before they replace</summary><p>The previous installation stays available until its replacement is committed. Atomic renames, a recovery journal and an installation lock protect the switch. <code>--recover</code> resumes an abandoned installation; <code>--wait</code> waits for an active one.</p></details><details><summary>Archives and executables, not system installers</summary><p>Binzo accepts standalone executables, tar, gzip and ZIP. XZ and bzip2 formats need their corresponding utilities. Filename heuristics filter recognized source archives and metadata, plus OS installer formats such as DMG, DEB and MSI. Desktop app bundles are excluded from executable discovery. The downloaded tool’s system libraries remain its own requirements.</p></details><details><summary>GitHub first, with room for other registries</summary><p>The built-in GitHub provider needs no registry configuration or jq. Public repositories work without authentication, within GitHub’s API limits. The CLI can use <code>GH_TOKEN</code> or <code>GITHUB_TOKEN</code> for private repositories. Declarative custom registries use JSON/YAML definitions and require jq.</p><a href={`${repository}#additional-registries`}>Read the registry documentation</a></details></div></section>
		</div>
		</main>
		<footer className="binzo-footer binzo-container"><div><a className="binzo-wordmark" href="#top"><PackageOpen size={25} aria-hidden="true" />binzo</a><p>Your tools, straight from the source.<br />Made by <a href="https://darylcecile.net">Daryl Cecile</a>.</p></div><nav aria-label="Footer navigation"><a href={`${repository}#readme`}>Documentation</a><a href={repository}>Source code <ArrowUpRight size={14} aria-hidden="true" /></a><a href={`${repository}/releases`}>Releases</a><a href={`${repository}/blob/main/LICENSE`}>MIT license</a></nav></footer>
	</div>;
}
