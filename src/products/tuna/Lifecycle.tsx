import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { repository } from './meta';

const feedback = 'When fixing a bug, keep changes focused. Don’t refactor unrelated files.';
const rule = 'For bug fixes, keep changes focused; do not refactor unrelated files.';
const harnesses = [
	{ name: 'OpenCode V2', path: '~/.config/opencode/AGENTS.md' },
	{ name: 'Copilot CLI', path: '~/.copilot/copilot-instructions.md' },
	{ name: 'Codex', path: '~/.codex/AGENTS.md' },
	{ name: 'Claude Code', path: '~/.claude/CLAUDE.md' },
];

function AgentLookup() {
	const [harness, setHarness] = useState(0);
	const selected = harnesses[harness];
	return <>
		<label className="tuna-harness-label" htmlFor="tuna-future-harness">Your next coding harness</label>
		<select id="tuna-future-harness" value={harness} onChange={event => setHarness(Number(event.target.value))}>{harnesses.map((item, i) => <option key={item.name} value={i}>{item.name}</option>)}</select>
		<p className="tuna-next-task">Next task: fix a login bug.</p>
		<p>Before deciding what to change, the agent can ask Tuna for your bug-fix preferences.</p>
		<div className="tuna-lookup-example">
			<p><code>preferences</code> tool arguments</p>
			<pre><code>{'{"query":"bug fixes"}'}</code></pre>
			<p className="tuna-lookup-answer"><strong>Relevant preference</strong>{rule}</p>
		</div>
		<p className="tuna-harness-path" aria-live="polite"><strong>{selected.name} also reads the shared instructions via</strong><code>{selected.path}</code></p>
	</>;
}

export default function Lifecycle() {
	return <section className="tuna-lifecycle" id="how-it-works" aria-labelledby="tuna-lifecycle-title">
		<div className="tuna-demo-heading"><h2 id="tuna-lifecycle-title">Say it in your work. Keep it for the next.</h2><p>Illustrative example <span>· No live AI analysis</span></p></div>
		<ol className="tuna-story-flow" aria-label="From your feedback to the next agent">
			<li><h3><span>1</span>You correct your agent</h3><blockquote>“{feedback}”</blockquote><p>You’re just working and giving feedback. Tuna listens in the background and retains useful working preferences with the words that support them.</p><p className="tuna-story-timing">Feedback analysis runs every 30 seconds by default.</p></li>
			<li>
				<h3><span>2</span>Tuna maintains AGENTS.md</h3>
				<p>Once Tuna learns this preference, it can publish one concise rule and remove older handwritten copies.</p>
				<div className="tuna-instruction-before">
					<h4>Before · your handwritten copies</h4>
					<pre><code>{'- Keep bug fixes focused; no unrelated refactors.\n- When fixing bugs, leave unrelated refactoring alone.'}</code></pre>
				</div>
				<ArrowDown className="tuna-upkeep-arrow" size={20} aria-hidden="true" />
				<div className="tuna-instruction-after">
					<h4>After · one maintained preference</h4>
					<pre><code>{'## Learned preferences\n\n- '}{rule}</code></pre>
				</div>
				<p className="tuna-story-timing">Automatic refresh at 23:00 local time, after pending feedback is analyzed. Shared file: <code>~/.agents/AGENTS.md</code>.</p>
			</li>
			<li><h3><span>3</span>The next agent looks it up</h3><AgentLookup /></li>
		</ol>
		<div className="tuna-story-bottom"><p>That’s the loop: you give feedback, Tuna keeps the instructions current, and your agents can find the relevant expectations. No daily file-tending required.</p><details className="tuna-story-evidence"><summary>What if I repeat myself—or change my mind?</summary><div><h3>More support, not more copies of the rule.</h3><ol><li><span>Session 1 · Copilot CLI</span><blockquote>“{feedback}”</blockquote></li><li><span>Session 2 · Claude Code</span><blockquote>“As before: keep bug fixes focused, without unrelated refactoring.”</blockquote></li></ol><p>If the model judges the intent and conditions equivalent, both observed messages can support one preference. Their quotes stay in its history.</p><p>A later explicit change under the same conditions can supersede the earlier preference in lookups after analysis. Its older evidence stays separate; repetition does not overrule your new intent. The shared file catches up at consolidation.</p><p>Consolidation also rechecks support, narrows overbroad rules, and retires notes unconfirmed for 180 days by default. Changed instruction files are backed up.</p></div></details></div>
		<p className="tuna-demo-note">Authored feedback and instruction excerpts, illustrating the <a href={`${repository}/blob/main/internal/tuna/analyzer.go`}>preference policy</a>. Learning and cleanup depend on your selected model; tool use and adherence depend on the agent. Automatic upkeep needs the service running. This page captures no conversations.</p>
	</section>;
}
