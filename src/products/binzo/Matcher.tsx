import { useState } from 'react';
import { Check, FileArchive, RotateCcw } from 'lucide-react';
import CopyCommand from './CopyCommand';
import { planInstall } from './plan';
import { assetMatch, isInstallableAsset, type Machine } from './reference/assets';
import { matcherRevision, recordedOn, releases, type ReleaseAsset } from './releases';
import { repository } from './meta';

function assetStatus(asset: ReleaseAsset, machine: Machine, candidates: ReleaseAsset[]) {
	if (!isInstallableAsset(asset.name)) return 'Metadata';
	if (assetMatch(asset.name, machine) === 'incompatible') return 'Other target';
	if (!candidates.some((candidate) => candidate.name === asset.name)) return 'Not preferred';
	return assetMatch(asset.name, machine) === 'exact' ? 'Matching target' : 'Target unclear';
}

function sizeLabel(size: number) {
	return size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KiB` : `${(size / 1024 / 1024).toFixed(1)} MiB`;
}

export default function Matcher() {
	const [releaseIndex, setReleaseIndex] = useState(0);
	const [machine, setMachine] = useState<Machine>({ platform: 'darwin', arch: 'arm64', libc: 'gnu' });
	const [choice, setChoice] = useState('');
	const release = releases[releaseIndex];
	const plan = planInstall(release, machine, choice);

	function changeMachine(next: Partial<Machine>) {
		setMachine({ ...machine, ...next });
		setChoice('');
	}
	function reset() {
		setReleaseIndex(0);
		setMachine({ platform: 'darwin', arch: 'arm64', libc: 'gnu' });
		setChoice('');
	}

	return <div className="binzo-matcher">
		<div className="binzo-matcher-controls">
			<label>Recorded release<select value={releaseIndex} onChange={(event) => { setReleaseIndex(Number(event.target.value)); setChoice(''); }}>
				{releases.map((item, index) => <option key={item.repo} value={index}>{item.repo} {item.tag}</option>)}
			</select></label>
			<label>Operating system<select value={machine.platform} onChange={(event) => changeMachine({ platform: event.target.value })}>
				<option value="darwin">macOS</option><option value="linux">Linux</option><option value="win32">Windows</option>
			</select></label>
			<label>CPU<select value={machine.arch} onChange={(event) => changeMachine({ arch: event.target.value })}>
				<option value="arm64">ARM64</option><option value="x64">x64</option>
			</select></label>
			{machine.platform === 'linux' && <label>Linux libc<select value={machine.libc} onChange={(event) => changeMachine({ libc: event.target.value as 'gnu' | 'musl' })}>
				<option value="gnu">glibc (GNU)</option><option value="musl">musl</option>
			</select></label>}
			<button type="button" onClick={reset} className="binzo-reset"><RotateCcw size={15} aria-hidden="true" />Reset</button>
		</div>
		<div className="binzo-manifest-heading"><span><FileArchive size={16} aria-hidden="true" />{release.assets.length} uploaded assets</span><a href={release.url}>View this release</a></div>
		<div className="binzo-manifest" role="region" aria-label="Release asset matching results" tabIndex={0}>
			<table><caption className="binzo-sr-only">{release.repo} {release.tag} assets and filename matches</caption><thead><tr><th scope="col">Filename</th><th scope="col">Size</th><th scope="col">Matcher result</th></tr></thead><tbody>
				{release.assets.map((asset) => {
					const status = assetStatus(asset, machine, plan.candidates);
					const matched = plan.candidates.some((candidate) => candidate.name === asset.name);
					return <tr key={asset.name} data-match={matched} data-selected={asset.name === plan.selected?.name}>
						<th scope="row"><code>{asset.name}</code></th><td>{sizeLabel(asset.size)}</td><td><span className="binzo-asset-status">{matched && <Check size={14} aria-hidden="true" />}{status}</span></td>
					</tr>;
				})}
			</tbody></table>
		</div>
		<div className="binzo-plan" data-state={plan.status}>
			<div className="binzo-plan-title" role="status" aria-live="polite">
				{plan.status === 'unavailable' ? <><h3>No compatible download.</h3><p>This release has no CLI asset matching {machine.platform === 'win32' ? 'Windows' : machine.platform}/{machine.arch}. Check another release or the project’s installation instructions.</p></> : plan.status === 'choice' ? <><h3>Binzo would ask you to choose.</h3><p>{plan.candidates.length > 1 ? 'More than one variant matches this target.' : 'This filename does not fully identify its target.'} Select an asset below to make that choice explicit in the command.</p></> : <><h3>{plan.explicit ? 'Your choice, made explicit.' : 'One match. Ready to plan.'}</h3><p><code>{plan.selected?.name}</code></p></>}
			</div>
			{(plan.status === 'choice' || plan.explicit) && <fieldset className="binzo-choices"><legend>Choose a release asset</legend>{plan.candidates.map((asset) => <label key={asset.name}><input type="radio" name="binzo-asset" value={asset.name} checked={choice === asset.name} onChange={() => setChoice(asset.name)} /><code>{asset.name}</code></label>)}</fieldset>}
			{machine.platform === 'linux' && releaseIndex === 1 && machine.libc === 'gnu' && <p className="binzo-plan-note">The real matcher keeps both GNU and musl assets on glibc Linux. On musl, it excludes known GNU/glibc builds.</p>}
			{machine.platform === 'linux' && releaseIndex === 0 && <p className="binzo-plan-note">These filenames do not identify libc. A filename match does not establish that the executable will run on every Linux distribution.</p>}
			{plan.command && <><p className="binzo-command-label">Run on the selected machine, with Binzo already installed</p><CopyCommand command={plan.command} label="Copy planned install command" /><p className="binzo-plan-note">The exact tag reproduces this release selection. It does not pin future updates. The CLI detects the machine where you run it.</p></>}
			{plan.status === 'unavailable' && <a className="binzo-text-link" href={`https://github.com/${release.repo}#readme`}>Read {release.repo.split('/')[1]}’s installation instructions</a>}
		</div>
		<details className="binzo-demo-provenance"><summary>Where these results come from</summary><p>Public release metadata recorded {recordedOn}. Tuna v0.1.0 was published 12 October 2026; Binzo v0.0.3 on 14 September 2026. This runs Binzo’s <a href={`${repository}/blob/${matcherRevision}/src/helpers/assets.ts`}>actual portable filename matcher at {matcherRevision.slice(0, 7)}</a>, under the <a href={`${repository}/blob/${matcherRevision}/LICENSE`}>MIT license</a>.</p><p>This preview models a new install, without a remembered asset variant. Binzo recognizes platform aliases, filters known metadata and incompatible targets, prefers exact matches, and collapses equivalent archive formats. It asks when a choice remains. Filename heuristics are imperfect: this revision does not recognize the bare <code>SHA256SUMS</code> name as metadata, but prefers exact platform matches over it.</p><p>Only asset selection and command planning run in your browser. No files are downloaded, unpacked or installed. The native CLI inspects the archive’s executables afterward and may require <code>--binary</code>. The preview does not check their contents or runtime dependencies.</p></details>
	</div>;
}
