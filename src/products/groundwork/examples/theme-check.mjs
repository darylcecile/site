import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const evidence = process.env.GROUNDWORK_EVIDENCE_DIR;
const source = process.env.GROUNDWORK_SOURCE_DIR;
if (!evidence || !source) throw new Error('Run this check through Groundwork.');
const env = { ...process.env, STATE_FILE: join(evidence, 'state.json') };

function app(...args) {
	const run = spawnSync(process.execPath, [join(source, 'preferences.mjs'), ...args], { env, encoding: 'utf8' });
	if (run.error || run.status !== 0) {
		console.error(run.error?.message || run.stderr || 'Preferences process could not complete.');
		process.exit(2);
	}
	return run.stdout.trim();
}

app('set', 'dark');
// A separate application process reads the stored value.
const actual = app('get');
const passed = actual === 'dark';
writeFileSync(join(evidence, 'after-restart.json'), JSON.stringify({ expected: 'dark', actual }, null, 2) + '\n');
writeFileSync(join(evidence, 'observation.json'), JSON.stringify({
	observations: [{
		id: 'theme-after-restart',
		status: passed ? 'passed' : 'failed',
		observed: `A fresh application process read theme=${actual}`,
		evidence: ['after-restart.json'],
	}],
}, null, 2) + '\n');
console.log(`Theme after restart: ${actual}`);
process.exitCode = passed ? 0 : 1;
