import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import CopyBlock from './CopyBlock';
import Evidence from './Evidence';
import Examples from './Examples';
import Reference from './Reference';
import { repository, source } from './meta';
import '@fontsource-variable/manrope';
import '@fontsource-variable/geist-mono';
import './groundwork.css';

function Mark() {
	return (
		<svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
			<path d="M26 7H7v18h19V15H16" stroke="currentColor" strokeWidth="3.5" />
		</svg>
	);
}

function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const dark = mounted && resolvedTheme === 'dark';
	return (
		<button className="gw-theme" type="button" aria-label="Toggle color theme" disabled={!mounted} onClick={() => setTheme(dark ? 'light' : 'dark')}>
			{dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
		</button>
	);
}

const installCommands = 'bun add --global git+https://github.com/darylcecile/groundwork.git\ngroundwork install';
const adoptionPrompt = 'Use verify-work to set this project up. Reuse its existing tools and start with one real user journey. Then help me make a small change and show evidence that it works.';

export default function Page() {
	return (
		<div className="groundwork-site" id="gw-top">
			<a className="gw-skip" href="#gw-main">Skip to content</a>
			<header className="gw-header gw-container">
				<a className="gw-wordmark" href="#gw-top" aria-label="Groundwork home"><Mark />Groundwork</a>
				<nav aria-label="Main navigation">
					<a href="#evidence">The report</a>
					<a href="#why">Why Groundwork</a>
					<a href="#start">Get started</a>
				</nav>
				<div className="gw-header-actions">
					<a href={repository} className="gw-source-link">GitHub <ArrowUpRight size={16} aria-hidden="true" /></a>
					<ThemeToggle />
				</div>
			</header>
			<main id="gw-main" tabIndex={-1}>
				<section className="gw-hero gw-container" aria-labelledby="gw-title">
					<h1 id="gw-title">Let the agent work.<br />Get your attention back.</h1>
					<div className="gw-hero-copy">
						<p>Groundwork is a verification and trust framework for coding agents. Set the outcome and guardrails, step away, and return to a report with proof you can inspect.</p>
						<div className="gw-hero-actions">
							<a href="#start" className="gw-button">Get Groundwork <ArrowRight size={17} aria-hidden="true" /></a>
							<a className="gw-text-link" href="#evidence">See the return report <ArrowDown size={15} aria-hidden="true" /></a>
						</div>
						<p className="gw-compatibility">For GitHub Copilot CLI/app and OpenCode 2.</p>
					</div>
				</section>
				<Evidence />

				<section className="gw-origin" id="why" aria-labelledby="gw-origin-title">
					<div className="gw-container gw-origin-layout">
						<div className="gw-origin-story">
							<h2 id="gw-origin-title">When checking the agent<br />became the job.</h2>
							<p>As Daryl used agents for more of his development work, constantly checking what they were doing became overwhelming. Every context switch added mental load. It led to burnout.</p>
							<p>He built Groundwork to put verification and trust into a repeatable framework: define the guardrails, enforce checks, and bring back proof. The goal is to delegate a task and return to its result, without reconstructing the agent’s transcript.</p>
						</div>
						<figure className="gw-principle">
							<blockquote><p>“Because I trust the framework, I don’t need to trust the agent.”</p></blockquote>
							<figcaption><a href="https://darylcecile.net">Daryl Cecile</a><span>Creator of Groundwork</span></figcaption>
						</figure>
					</div>
				</section>

				<section className="gw-workflow gw-section gw-container" id="workflow" aria-labelledby="gw-workflow-title">
					<div className="gw-section-heading">
						<h2 id="gw-workflow-title">A process to trust.<br />A clear place to return.</h2>
						<p>Groundwork connects the task, the work and the proof. Each part takes something out of your head and puts it into a record you can revisit.</p>
					</div>
					<ol className="gw-workflow-steps">
						<li>
							<span className="gw-step-number">1</span>
							<div className="gw-step-copy">
								<h3>Make the outcome and guardrails explicit.</h3>
								<p>Behaviour mapping locates the feature and how to exercise it. Task tracking keeps the request, constraints and definition of done together. Project-owned checks and invariants make the important guardrails executable.</p>
							</div>
							<div className="gw-step-record">
								<strong>A shared definition of done</strong>
								<p>Maps, task notes and the verification catalogue give the agent context to work from.</p>
								<a href={`${source}/skills/explore/SKILL.md`}>How exploration works <ArrowUpRight size={14} aria-hidden="true" /></a>
							</div>
						</li>
						<li>
							<span className="gw-step-number">2</span>
							<div className="gw-step-copy">
								<h3>Delegate with a process behind the work.</h3>
								<p>The skills guide the agent through implementation, verification and review. Checks exercise the real behaviour and retain their observations. You can step away while the agent works toward an outcome already defined.</p>
							</div>
							<div className="gw-step-record">
								<strong>Checks, verification and review</strong>
								<p>The CLI runs your project’s checks. Independent judgement belongs to the agent workflow.</p>
								<a href={`${source}/skills/implement/SKILL.md`}>The implementation workflow <ArrowUpRight size={14} aria-hidden="true" /></a>
							</div>
						</li>
						<li>
							<span className="gw-step-number">3</span>
							<div className="gw-step-copy">
								<h3>Come back to the report. Inspect the proof.</h3>
								<p>See which requirements are verified, failed or still unverified. Open the evidence that supports them and decide whether the intended result holds. What needs your attention is explicit.</p>
								<p>Return to your agent’s handoff message, open <code className="gw-token">groundwork view report</code> in the terminal, and inspect the saved artifacts in <code>.groundwork/runs/&lt;id&gt;/</code>.</p>
							</div>
							<div className="gw-step-record">
								<strong>Evidence you can look at</strong>
								<p>Your project’s proof can include assertion output, screenshots and traces. UI work needs an observation of the actual screen.</p>
								<a href={`${source}/skills/verify-work/SKILL.md`}>The evidence standard <ArrowUpRight size={14} aria-hidden="true" /></a>
							</div>
						</li>
					</ol>
					<p className="gw-explain-note">For a focused explanation of a concept or code, ask the standalone <a href={`${source}/skills/explain/SKILL.md`}><code>explain</code> skill</a>. It can help without starting an implementation task.</p>
				</section>

				<section className="gw-start" id="start" aria-labelledby="gw-start-title">
					<div className="gw-container gw-start-layout">
						<div>
							<h2 id="gw-start-title">Give your next task<br />a better handoff.</h2>
							<p>Start with one real journey. Connect the tools you already use to a clear outcome and its evidence. Let that be your first complete loop.</p>
							<p className="gw-small">Groundwork requires Bun, Git and Bash. Your project can use any language or toolchain.</p>
							<a href={`${source}/skills/verify-work/verify.mjs#L55-L65`} className="gw-text-link">Read the skill installer <ArrowUpRight size={16} aria-hidden="true" /></a>
						</div>
						<ol className="gw-start-steps">
							<li>
								<h3>Install the CLI and skills</h3>
								<CopyBlock text={installCommands} label="Copy Groundwork installation commands" />
								<p>The installer registers bundled skills in <code>~/.agents/skills/</code> and adds instructions for Copilot and OpenCode. Start a new Copilot session and reload OpenCode afterward.</p>
							</li>
							<li>
								<h3>Give your agent this starting point</h3>
								<CopyBlock text={adoptionPrompt} code={false} label="Copy project adoption prompt" />
								<p>The agent explores the project, runs <code>groundwork init</code> and fills in the guide and check configuration from what the project actually supports.</p>
							</li>
						</ol>
					</div>
				</section>

				<Examples />
				<Reference installCommands={installCommands} />

				<section className="gw-close gw-container">
					<h2>Delegate the next task.<br />Come back to the evidence.</h2>
					<a href="#start" className="gw-button">Start your first journey <ArrowRight size={18} aria-hidden="true" /></a>
				</section>
			</main>
			<footer className="gw-footer gw-container">
				<div><a href="#gw-top" className="gw-wordmark"><Mark />Groundwork</a><p>Made by <a href="https://darylcecile.net">Daryl Cecile</a>.</p></div>
				<nav aria-label="Footer navigation">
					<a href={repository}>Source code <ArrowUpRight size={15} aria-hidden="true" /></a>
					<a href={`${source}/WORKFLOW.md`}>Workflow</a>
					<a href={`${source}/skills/verify-work/references/verification.md`}>CLI reference</a>
					<a href={`${source}/pr-verification/README.md`}>PR verification</a>
				</nav>
			</footer>
		</div>
	);
}
