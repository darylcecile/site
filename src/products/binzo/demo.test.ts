import { describe, expect, test } from 'bun:test';
import { planInstall } from './plan';
import { releases } from './releases';
import { assetChoices, assetMatch } from './reference/assets';

describe('recorded release planning', () => {
	test('Tuna selects macOS ARM64, excluding checksums and other targets', () => {
		const plan = planInstall(releases[0], { platform: 'darwin', arch: 'arm64' });
		expect(plan.status).toBe('selected');
		expect(plan.selected?.name).toBe('tuna_darwin_arm64');
		expect(plan.command).toBe('binzo add darylcecile/tuna@v0.1.0');
		expect(plan.candidates).toHaveLength(1);
	});
	test('Tuna Windows has no install command; it does not fall back to another platform', () => {
		const plan = planInstall(releases[0], { platform: 'win32', arch: 'x64' });
		expect(plan.status).toBe('unavailable');
		expect(plan.command).toBeUndefined();
	});
	test('glibc Linux requires a deliberate GNU or musl choice', () => {
		const machine = { platform: 'linux', arch: 'x64', libc: 'gnu' as const };
		const plan = planInstall(releases[1], machine);
		expect(plan.status).toBe('choice');
		expect(plan.command).toBeUndefined();
		expect(plan.candidates.map((asset) => asset.name)).toEqual(['binzo-linux-x64-gnu.tar.gz', 'binzo-linux-x64-musl.tar.gz']);
		expect(planInstall(releases[1], machine, 'binzo-linux-x64-gnu.tar.gz').command).toBe('binzo add darylcecile/binzo@v0.0.3 --asset "binzo-linux-x64-gnu.tar.gz"');
	});
	test('musl excludes GNU; a stale choice never overrides platform compatibility', () => {
		const plan = planInstall(releases[1], { platform: 'linux', arch: 'arm64', libc: 'musl' }, 'binzo-linux-x64-gnu.tar.gz');
		expect(plan.selected?.name).toBe('binzo-linux-arm64-musl.tar.gz');
		expect(plan.explicit).toBe(false);
	});
	test('an uncertain filename requires a choice and equivalent formats collapse', () => {
		const assets = ['tool.tar.gz', 'tool.zip'].map((name) => ({ id: name, name, size: 1, downloadUrl: `https://example.com/${name}` }));
		const release = { ...releases[0], assets };
		expect(assetChoices(assets, { platform: 'darwin', arch: 'arm64' })).toHaveLength(1);
		expect(planInstall(release, { platform: 'darwin', arch: 'arm64' }).status).toBe('choice');
		expect(planInstall(release, { platform: 'darwin', arch: 'arm64' }, 'tool.tar.gz').explicit).toBe(true);
	});
	test('target aliases never confuse x86_64 with 32-bit x86', () => {
		expect(assetMatch('tool-x86_64-unknown-linux-gnu.tar.gz', { platform: 'linux', arch: 'ia32' })).toBe('incompatible');
		expect(assetMatch('tool-aarch64-apple-darwin.tar.gz', { platform: 'darwin', arch: 'arm64' })).toBe('exact');
	});
});
