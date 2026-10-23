import { readFileSync, writeFileSync } from 'node:fs';

// Synthetic CLI app. Its state file is supplied by the isolated check.
const file = process.env.STATE_FILE;
if (!file) throw new Error('STATE_FILE is required.');

const [action, theme] = process.argv.slice(2);
if (action === 'set' && ['light', 'dark'].includes(theme)) {
	writeFileSync(file, JSON.stringify({ theme }));
} else if (action === 'get') {
	console.log(JSON.parse(readFileSync(file, 'utf8')).theme);
} else {
	console.error('Use: preferences.mjs set <light|dark>, or get');
	process.exitCode = 2;
}
