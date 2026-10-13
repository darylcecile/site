import { useState } from 'react';
import { CheckCircle2, CircleAlert, FileCode2 } from 'lucide-react';
import { Code, CopyButton } from './Code';
import { sourceCommit, sourceUrl, specimens } from './specimens';

export default function Explorer() {
	const [selected, setSelected] = useState(0);
	const [variant, setVariant] = useState<'before' | 'after'>('before');
	const specimen = specimens[selected];
	const recording = specimen[variant];
	const passed = recording.exitCode === 0;

	function selectSpecimen(index: number) {
		setSelected(index);
		setVariant('before');
	}

	return (
		<section className="sakoa-section sakoa-explorer-section" id="explorer" aria-labelledby="sakoa-explorer-heading">
			<div className="sakoa-section-heading">
				<div>
					<p className="sakoa-kicker">Meet the compiler</p>
					<h2 id="sakoa-explorer-heading">Small changes.<br />Specific feedback.</h2>
				</div>
				<p>Choose a language feature, then compare two real programs. See what the compiler catches and what changes when you make the intent explicit.</p>
			</div>
			<div className="sakoa-explorer">
				<div className="sakoa-example-picker" role="group" aria-label="Language feature">
					{specimens.map((item, index) => (
						<button key={item.id} type="button" aria-pressed={selected === index} onClick={() => selectSpecimen(index)}>{item.label}</button>
					))}
				</div>
				<div className="sakoa-example-question">
					<h3>{specimen.question}</h3>
					<div className="sakoa-variants" role="group" aria-label="Program version">
						{(['before', 'after'] as const).map(value => (
							<button type="button" key={value} aria-pressed={variant === value} onClick={() => setVariant(value)}>{specimen[value].label}</button>
						))}
					</div>
				</div>
				<div className="sakoa-workbench">
					<div className="sakoa-editor">
						<div className="sakoa-pane-title">
							<span><FileCode2 size={15} aria-hidden="true" />{recording.file}</span>
							<CopyButton key={recording.file} text={`${recording.source}\n`} />
						</div>
						<Code source={recording.source} highlighted={recording.lines} label={`${recording.file} source, read-only`} />
					</div>
					<div className="sakoa-result">
						<div className="sakoa-pane-title"><span>Compiler output</span><span className="sakoa-recorded">Recorded</span></div>
						<p className={`sakoa-result-status ${passed ? 'sakoa-result-pass' : 'sakoa-result-fail'}`}>
							{passed ? <CheckCircle2 size={17} aria-hidden="true" /> : <CircleAlert size={17} aria-hidden="true" />}
							{recording.status}
						</p>
						<div className="sakoa-transcript" key={recording.file}>
							<p className="sakoa-command"><span aria-hidden="true">$ </span>{recording.command}</p>
							<pre role="region" tabIndex={0} aria-label="Recorded command output"><code>{recording.output}</code></pre>
						</div>
						<p className="sakoa-exit">Process exit code <code>{recording.exitCode}</code></p>
					</div>
				</div>
				<div className="sakoa-example-explanation">
					<p>{recording.explanation}</p>
					<a href={`${sourceUrl}/${specimen.docs}`}>Read the language guide</a>
				</div>
			</div>
			<p className="sakoa-recording-note">Recorded compiler results, not live execution. Fixed source programs were checked with Sakoa 0.1.0 at <a href={sourceUrl}><code>{sourceCommit.slice(0, 7)}</code></a>. Output includes the original cache state.</p>
			<p className="sakoa-sr-only" role="status">{specimen.label}, {recording.label}. {recording.status}. {recording.explanation}</p>
		</section>
	);
}
