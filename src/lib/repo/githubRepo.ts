import { cacheLife, cacheTag } from "next/cache";

export type RepoStats = {
	repo: string;
	commitsCount: number | null;
	lastUpdated: string | null;
	htmlUrl: string | null;
	isPrivate: boolean;
};

function authHeaders(): HeadersInit {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "darylcecile.net",
	};
	const token = process.env.GITHUB_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

function parseLastPageFromLink(link: string | null): number | null {
	if (!link) return null;
	// Example: <https://api.github.com/...&page=2>; rel="next", <https://api.github.com/...&page=42>; rel="last"
	const match = link.split(",").find((part) => /rel="last"/.test(part));
	if (!match) return null;
	const url = match.match(/<([^>]+)>/)?.[1];
	if (!url) return null;
	try {
		const page = new URL(url).searchParams.get("page");
		return page ? Number.parseInt(page, 10) : null;
	} catch {
		return null;
	}
}

export type AggregatedRepoStats = {
	repos: RepoStats[];
	commitsCount: number | null;
	lastUpdated: string | null;
};

export async function getAggregatedRepoStats(
	repo: string | string[],
): Promise<AggregatedRepoStats | null> {
	const repos = Array.isArray(repo) ? repo : [repo];
	if (repos.length === 0) return null;

	const results = await Promise.all(repos.map((r) => getRepoStats(r)));
	const stats = results.filter((s): s is RepoStats => s != null);
	if (stats.length === 0) return null;

	const commitsValues = stats
		.map((s) => s.commitsCount)
		.filter((n): n is number => typeof n === "number");
	const commitsCount = commitsValues.length
		? commitsValues.reduce((sum, n) => sum + n, 0)
		: null;

	const updatedTimes = stats
		.map((s) => s.lastUpdated)
		.filter((d): d is string => d != null)
		.map((d) => new Date(d).getTime())
		.filter((t) => !Number.isNaN(t));
	const lastUpdated = updatedTimes.length
		? new Date(Math.max(...updatedTimes)).toISOString()
		: null;

	return { repos: stats, commitsCount, lastUpdated };
}

async function fetchRepoStatsUncached(repo: string): Promise<RepoStats> {
	if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
		throw new Error(`Invalid repo identifier: ${repo}`);
	}

	const headers = authHeaders();

	const repoRes = await fetch(`https://api.github.com/repos/${repo}`, {
		headers,
	});
	if (!repoRes.ok) {
		throw new Error(`GitHub repo fetch failed: ${repo} (${repoRes.status})`);
	}
	const repoData = (await repoRes.json()) as {
		pushed_at?: string;
		updated_at?: string;
		html_url?: string;
		private?: boolean;
		visibility?: string;
	};

	const isPrivate =
		repoData.private === true || repoData.visibility === "private";

	const commitsRes = await fetch(
		`https://api.github.com/repos/${repo}/commits?per_page=1`,
		{ headers },
	);

	let commitsCount: number | null = null;
	if (commitsRes.ok) {
		const lastPage = parseLastPageFromLink(commitsRes.headers.get("link"));
		if (lastPage != null) {
			commitsCount = lastPage;
		} else {
			const commits = (await commitsRes.json()) as unknown[];
			commitsCount = Array.isArray(commits) ? commits.length : null;
		}
	}

	return {
		repo,
		commitsCount,
		lastUpdated: repoData.pushed_at ?? repoData.updated_at ?? null,
		htmlUrl: isPrivate ? null : (repoData.html_url ?? `https://github.com/${repo}`),
		isPrivate,
	};
}

async function fetchRepoStatsCached(repo: string): Promise<RepoStats> {
	"use cache";

	cacheTag(`repo-stats:${repo}`);
	cacheLife("hours");

	return fetchRepoStatsUncached(repo);
}

export async function getRepoStats(repo: string): Promise<RepoStats | null> {
	try {
		return await fetchRepoStatsCached(repo);
	} catch {
		// Don't cache failures — returning null here keeps the cache clean so
		// transient errors (rate limits, missing token, etc.) recover next call.
		return null;
	}
}
