import { ArrowDown, Check, CircleDashed, X } from 'lucide-react';
import recording from './recording/runs.json';
import recordingUrl from './recording/runs.json?url';
import { source } from './meta';

const fixed = recording.records.find(run => run.id === 'fixed')!;
const otherOutcomes = [
	{ id: 'failure', title: 'When the preference was wrong', note: 'The broken version saved “light” instead of “dark”. The check failed and retained the value it actually read.' },
	{ id: 'coverage', title: 'When a requirement had no proof', note: 'A separate recording added a requirement to see the theme on a screen. This sample has no visual interface, so that requirement stayed unverified even though storage passed.' },
	{ id: 'stale', title: 'When the source changed afterward', note: 'Reopening the report after a source edit marked it inconclusive. The saved requirement still reads verified, but that historical observation cannot close the current change. The affected behaviour needs a fresh check.' },
];

function Status({ status }: { status: string }) {
	const Icon = status === 'verified' || status === 'passed' ? Check : status === 'failed' ? X : CircleDashed;
	return <span className={`gw-status gw-status-${status}`}><Icon size={14} aria-hidden="true" />{status}</span>;
}

type RecordedRun = (typeof recording.records)[number];

function RecordedOutput({ run }: { run: RecordedRun }) {
	return (
		<details className="gw-record-output">
			<summary>Recorded CLI output <span>exit {run.exitCode}</span></summary>
			<div className="gw-output">
				<pre className="gw-command-line" tabIndex={0} role="region" aria-label="Recorded invocation"><code>{run.command}</code></pre>
				<pre tabIndex={0} role="region" aria-label="Recorded command output"><code>{run.output}</code></pre>
			</div>
		</details>
	);
}

export default function Evidence() {
	return (
		<section className="gw-evidence-section gw-container" id="evidence" aria-labelledby="gw-evidence-title">
			<div className="gw-example-heading">
				<h2 id="gw-evidence-title">One request, followed through.</h2>
				<p>Illustrated handoff · real recorded CLI result</p>
			</div>
			<div className="gw-evidence-sheet">
				<div className="gw-story">
					<div className="gw-story-setup">
						<div className="gw-story-request">
							<h3>1. Your request</h3>
							<p>“Make this CLI remember my theme preference after it closes.”</p>
							<p className="gw-story-note">A small command-line sample that stores a preference.</p>
						</div>
						<div className="gw-story-proof">
							<h3>2. Groundwork asks for proof</h3>
							<p>The agent defines a check: save “dark” in one process, then read it in a fresh process. The value must still be “dark”.</p>
						</div>
					</div>
					<div className="gw-story-report">
						<h3>3. The report you return to</h3>
						<div className="gw-story-result"><Status status={fixed.coverage[0].status} /><p>The preference survived.</p></div>
						<p>The new process read “dark”, just as requested. The check passed and saved the observation.</p>
						<details className="gw-saved-observation">
							<summary>Inspect the saved observation</summary>
							<div className="gw-saved-content">
								<pre className="gw-json"><code>{fixed.evidence}</code></pre>
								<p>{fixed.observation}.</p>
								<p className="gw-artifact-path">Saved as <code>{fixed.evidencePath}</code></p>
							</div>
						</details>
						<p className="gw-story-note">You return to the outcome and its evidence, without retracing the agent’s work.</p>
					</div>
				</div>
				<div className="gw-record-footer">
					<p>A browser illustration of saved results. No agent or checks run here.</p>
					<a href="#example">Get the example <ArrowDown size={14} aria-hidden="true" /></a>
				</div>
			</div>
			<div className="gw-technical-details">
				<details>
					<summary>Technical details: output &amp; source</summary>
					<dl className="gw-source-facts">
						<div><dt>Requirement</dt><dd><code>{fixed.coverage[0].id}</code> — {fixed.coverage[0].expect}</dd></div>
						<div><dt>Check</dt><dd><code>{fixed.coverage[0].checks.join(', ')}</code> · passed · exit {fixed.exitCode}</dd></div>
						<div><dt>Fixture source</dt><dd>Uncommitted Git repository, with local files. This is the example’s fingerprint, not Groundwork’s revision.</dd></div>
						<div><dt>Fingerprint</dt><dd><code>{fixed.source.fingerprint}</code></dd></div>
						<div><dt>Run</dt><dd><code>{fixed.runId}</code></dd></div>
						<div><dt>Context</dt><dd>Isolated {fixed.context.storage} preferences · {fixed.context.runnerPlatform} / {fixed.context.runnerArchitecture} · Bun {recording.bun}</dd></div>
						<div><dt>Scope</dt><dd>One synthetic CLI journey. No rendered UI, other platform or source-aware baseline comparison was exercised in this recording.</dd></div>
					</dl>
					<RecordedOutput run={fixed} />
				</details>
				<details>
					<summary>Other recorded outcomes: when proof falls short</summary>
					<div className="gw-other-outcomes">
						{otherOutcomes.map(outcome => {
							const run = recording.records.find(item => item.id === outcome.id)!;
							return (
								<section key={outcome.id} aria-labelledby={`gw-outcome-${outcome.id}`}>
									<h3 id={`gw-outcome-${outcome.id}`}>{outcome.title}</h3>
									<p>{outcome.note}</p>
									<div className="gw-outcome-requirements">
										{run.coverage.map(item => <p key={item.id}><code>{item.id}</code><Status status={item.status} /></p>)}
									</div>
									<RecordedOutput run={run} />
								</section>
							);
						})}
					</div>
				</details>
			</div>
			<p className="gw-provenance">
				Recorded <time dateTime={recording.recordedAt}>{recording.recordedAt.slice(0, 10)}</time> with <a href={`${source}/skills/verify-work/verify.mjs`}>Groundwork {recording.cliRevision.slice(0, 7)}</a>. <a href={recordingUrl} download="groundwork-recorded-runs.json">Download the records</a>.
			</p>
		</section>
	);
}
