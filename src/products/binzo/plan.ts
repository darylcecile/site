import { assetChoices, assetMatch, type Machine } from './reference/assets';
import type { RecordedRelease, ReleaseAsset } from './releases';

type Plan = {
	status: 'selected' | 'choice' | 'unavailable';
	candidates: ReleaseAsset[];
	selected?: ReleaseAsset;
	command?: string;
	explicit: boolean;
};

// New installs only: mirrors selectAsset's single-exact-match branch. Terminal
// prompting is represented by browser radios; no remembered installation exists.
export function planInstall(release: RecordedRelease, machine: Machine, choice = ''): Plan {
	const candidates = assetChoices(release.assets, machine);
	if (!candidates.length) return { status: 'unavailable', candidates, explicit: false };
	const automatic = candidates.length === 1 && assetMatch(candidates[0].name, machine) === 'exact';
	const selected = automatic ? candidates[0] : candidates.find((asset) => asset.name === choice);
	if (!selected) return { status: 'choice', candidates, explicit: false };
	const command = `binzo add ${release.repo}@${release.tag}${automatic ? '' : ` --asset "${selected.name}"`}`;
	return { status: 'selected', candidates, selected, command, explicit: !automatic };
}
