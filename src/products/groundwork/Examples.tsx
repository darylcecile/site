import { useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import CopyBlock from './CopyBlock';
import preferences from './examples/preferences.mjs?raw';
import driver from './examples/theme-check.mjs?raw';
import config from './examples/verify.json?raw';
import plan from './examples/task.json?raw';
import archiveUrl from './examples/groundwork-theme-example.zip?url';

const files = [
	{ name: 'The app', path: 'preferences.mjs', content: preferences, note: 'A small CLI with a file-backed preference. The check supplies an isolated state file.' },
	{ name: 'The check', path: '.groundwork/scripts/theme-check.mjs', content: driver, note: 'Two separate app processes: one writes dark, the next reads. The assertion compares the observed value and saves evidence.' },
	{ name: 'The catalogue', path: '.groundwork/verify.json', content: config, note: 'One executable check covers the theme-persistence behaviour. Artifact and result paths are relative to the trial’s evidence directory.' },
	{ name: 'The plan', path: '.groundwork/plans/task.json', content: plan, note: 'One requirement bound to the check that actually asserts it. A plan adds coverage requirements; it does not select checks to run.' },
];

export default function Examples() {
	const [selected, setSelected] = useState(1);
	const file = files[selected];
	return (
		<section className="gw-section gw-container" id="example" aria-labelledby="gw-example-title">
			<div className="gw-section-heading">
				<h2 id="gw-example-title">See how the proof<br />is made.</h2>
				<p>The return report above comes from a real CLI run. Inspect the tiny app, the assertion and the requirement that connect the work to its proof.</p>
			</div>
			<div className="gw-example-layout">
				<div className="gw-example-guide">
					<h3>Run it in your terminal</h3>
					<p>Download and extract the example. It includes the app, check, catalogue, plan and a README. No package dependencies.</p>
					<a href={archiveUrl} download="groundwork-theme-example.zip" className="gw-button gw-button-secondary">Download example <ArrowDownToLine size={18} aria-hidden="true" /></a>
					<p>With Groundwork installed, run from the extracted directory:</p>
					<CopyBlock text={'git init\ngroundwork verify theme-persists --plan .groundwork/plans/task.json\ngroundwork view report'} label="Copy example commands" />
					<p className="gw-small">Expected: <strong>passed / 0</strong>. To reproduce the bug, save <code>{'{ theme: \'light\' }'}</code> in the app instead of <code>{'{ theme }'}</code>. Rerun the same check: it reads <code>light</code> and fails.</p>
				</div>
				<div className="gw-example-source">
					<div className="gw-file-picker">
						<label htmlFor="gw-example-file">Inspect a file</label>
						<select id="gw-example-file" value={selected} onChange={event => setSelected(Number(event.target.value))}>
							{files.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}
						</select>
					</div>
					<p className="gw-file-path"><code>{file.path}</code></p>
					<p className="gw-file-note">{file.note}</p>
					<CopyBlock key={file.path} text={file.content} label={`Copy ${file.path}`} scrollable />
				</div>
			</div>
		</section>
	);
}
