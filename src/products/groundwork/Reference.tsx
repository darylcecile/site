import { ArrowUpRight } from 'lucide-react';
import CopyBlock from './CopyBlock';
import { source } from './meta';

export default function Reference({ installCommands }: { installCommands: string }) {
	return (
		<section className="gw-reference gw-container" id="reference" aria-labelledby="gw-reference-title">
			<div className="gw-reference-intro">
				<h2 id="gw-reference-title">A framework you<br />can look inside.</h2>
				<p>The mechanics stay accessible: what a result establishes, how it stays current, and the files and commands behind it.</p>
				<a className="gw-text-link" href={`${source}/skills/verify-work/references/verification.md`}>Read the full reference <ArrowUpRight size={16} aria-hidden="true" /></a>
			</div>
			<div className="gw-trust-details">
				<details>
					<summary>What the report tells you</summary>
					<p>Requirements are <strong>verified</strong> when relevant observations support them, <strong>failed</strong> when an observation contradicts the expected result, and <strong>unverified</strong> when the necessary observation is missing.</p>
					<p>The CLI’s <strong>passed / 0</strong> means selected checks, planned coverage and required evidence are complete. <strong>Failed / 1</strong> retains observed failures. <strong>Inconclusive / 2</strong> means completion could not be established. Inspect the actual assertions and artifacts to decide what those results establish for your task.</p>
				</details>
				<details>
					<summary>Comparing a fix with previous source</summary>
					<p>Use <code className="gw-token">--base</code> <code>&lt;ref&gt;</code> with a driver configured for <code>compare: "regression"</code> and targeting <code>GROUNDWORK_SOURCE_DIR</code>. Both phases run the candidate’s driver against the selected source. The baseline must reproduce the intended assertion failure and the candidate must pass under the same declared context.</p>
					<p>An unavailable or already-passing baseline is inconclusive. <code className="gw-token">--changed</code> only selects checks; it does not perform this comparison.</p>
					<a href={`${source}/skills/verify-work/references/verification.md#repetition-and-baseline-comparison`}>Driver and comparison contract <ArrowUpRight size={14} aria-hidden="true" /></a>
				</details>
				<details>
					<summary>How freshness keeps evidence relevant</summary>
					<p><code>groundwork view report</code> rechecks saved source and evidence without rerunning commands. Source matching includes Git HEAD, tracked local changes and non-ignored untracked inputs, including the guide and reusable checks. Runtime evidence and local task files are excluded.</p>
					<p>Changed source or missing or altered evidence prevents reuse of a past success. External services, ignored inputs and workload assumptions need declared context and fresh observations when they change.</p>
					<CopyBlock text="groundwork view report" label="Copy report command" />
				</details>
				<details>
					<summary>Updating your installation</summary>
					<p><code>groundwork update</code> resolves the latest default-branch commit, reinstalls through Bun and registers the skills. At the inspected revision, it uses the package’s SSH repository URL and requires GitHub SSH access.</p>
					<p>For an HTTPS update, remove the existing package first, then reinstall and register the skills. Running the add command alone can retain the previously resolved Git revision.</p>
					<CopyBlock text={`bun remove --global @darylcecile/groundwork\n${installCommands}`} label="Copy HTTPS update commands" />
					<p>Start a new Copilot session and reload OpenCode afterward.</p>
					<a href={`${source}/lib/distribution.mjs#L79-L108`}>Read the update implementation <ArrowUpRight size={14} aria-hidden="true" /></a>
				</details>
				<details>
					<summary>Finding behaviours and choosing checks</summary>
					<p>Discover catalogue entries and recorded feature relationships. Maps guide investigation; they do not run checks.</p>
					<CopyBlock text={'groundwork view guide theme\ngroundwork map theme-persistence'} label="Copy discovery commands" />
					<p>Run all configured checks, select them by name, or use <code className="gw-token">--changed</code> to select mapped paths. Required checks and active invariants are included. Inspect unmapped changes for gaps.</p>
					<CopyBlock text={'groundwork verify\ngroundwork verify --changed main'} label="Copy verification commands" />
				</details>
				<details>
					<summary>What stays with the project</summary>
					<p>Root <code>AGENTS.md</code> points the agent to the project’s Groundwork context. Commit the guide, checks and reusable helpers. Local plans, task notes and run evidence are ignored by Git.</p>
					<dl className="gw-project-files">
						<div><dt><code>.groundwork/VERIFY.md</code></dt><dd>How to run the project, reach the feature and observe the expected behaviour.</dd></div>
						<div><dt><code>.groundwork/verify.json</code></dt><dd>Named checks, behaviour mappings and enforced project invariants.</dd></div>
						<div><dt><code>.groundwork/maps/</code></dt><dd>Source-backed explanations of ownership, dependencies and verification paths.</dd></div>
						<div><dt><code>.groundwork/tasks/</code></dt><dd>Local working notes: the task, decisions, definition of done and progress.</dd></div>
						<div><dt><code>.groundwork/runs/&lt;id&gt;/</code></dt><dd>The plan snapshot, results, logs and trial artifacts for a specific run.</dd></div>
					</dl>
				</details>
			</div>
		</section>
	);
}
