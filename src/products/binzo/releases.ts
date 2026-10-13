// Public GitHub release API snapshots, recorded 2026-10-13.
// Asset names and byte sizes are verbatim; no live API lookup is performed.
export type ReleaseAsset = { id: string; name: string; size: number; downloadUrl: string };
export type RecordedRelease = { repo: string; tag: string; published: string; url: string; assets: ReleaseAsset[] };

function release(repo: string, tag: string, published: string, files: [string, number][]): RecordedRelease {
	return {
		repo, tag, published, url: `https://github.com/${repo}/releases/tag/${tag}`,
		assets: files.map(([name, size]) => ({ id: name, name, size, downloadUrl: `https://github.com/${repo}/releases/download/${tag}/${name}` })),
	};
}

export const recordedOn = '13 October 2026';
export const matcherRevision = 'e9c4b5acd9035166c79a7fc1baaf34cca70712c5';
export const releases = [
	release('darylcecile/tuna', 'v0.1.0', '2026-10-12T14:38:39Z', [
		['checksums.txt', 334],
		['tuna_darwin_amd64', 13710880],
		['tuna_darwin_arm64', 13086706],
		['tuna_linux_amd64', 13533368],
		['tuna_linux_arm64', 12910776],
	]),
	release('darylcecile/binzo', 'v0.0.3', '2026-09-14T11:31:54Z', [
		['binzo-darwin-arm64.tar.gz', 24203237],
		['binzo-darwin-x64.tar.gz', 26769892],
		['binzo-linux-arm64-gnu.tar.gz', 35964840],
		['binzo-linux-arm64-musl.tar.gz', 34566924],
		['binzo-linux-x64-gnu.tar.gz', 35868890],
		['binzo-linux-x64-musl.tar.gz', 34654114],
		['binzo-windows-arm64.zip', 38335949],
		['binzo-windows-x64.zip', 39551118],
		['SHA256SUMS', 738],
	]),
];
