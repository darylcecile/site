import "@tanstack/react-start/server-only";
import { cachedJson } from "@/lib/server/cache.server";
import { fetchGithub } from "@/lib/server/github.server";
import { validateRepoIdentifier } from "@/lib/server/preview-validation";

export type RepoStats = {
	repo: string;
	commitsCount: number | null;
	lastUpdated: string | null;
	htmlUrl: string | null;
	isPrivate: boolean;
};

function parseLastPageFromLink(link: string | null): number | null {
	if (!link) return null;
	// Example: <https://api.github.com/...&page=2>; rel="next", <https://api.github.com/...&page=42>; rel="last"
	const match = link.split(",").find((part) => /rel="last"/.test(part));
	if (!match) return null;
	const url = match.match(/<([^>]+)>/)?.[1];
	if (!url) return null;
	try {
		const page = new URL(url).searchParams.get("page");
		const count = page ? Number.parseInt(page, 10) : NaN;
		return Number.isSafeInteger(count) && count > 0 ? count : null;
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

async function fetchCommitsCount(repo: string): Promise<number | null> {
	try {
		const commitsRes = await fetchGithub(`/repos/${repo}/commits?per_page=1`);
		if (!commitsRes.ok) {
			await commitsRes.body?.cancel();
			// GitHub returns 409 for an empty repository, which is a valid zero count.
			if (commitsRes.status === 409) return 0;
			throw new Error("GitHub commit request failed.");
		}
		const lastPage = parseLastPageFromLink(commitsRes.headers.get("link"));
		if (lastPage != null) {
			await commitsRes.body?.cancel();
			return lastPage;
		}
		const commits = await commitsRes.json() as unknown;
		if (!Array.isArray(commits)) throw new Error("GitHub returned an invalid commit list.");
		return commits.length;
	} catch {
		console.warn("[GitHub repository] Could not load commit count.");
		return null;
	}
}

async function fetchRepoStatsUncached(repo: string): Promise<RepoStats> {
	const repoRes = await fetchGithub(`/repos/${repo}`);
	if (!repoRes.ok) {
		await repoRes.body?.cancel();
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
	const commitsCount = await fetchCommitsCount(repo);

	return {
		repo,
		commitsCount,
		lastUpdated: repoData.pushed_at ?? repoData.updated_at ?? null,
		htmlUrl: isPrivate ? null : (repoData.html_url ?? `https://github.com/${repo}`),
		isPrivate,
	};
}

export async function getRepoStats(repo: string): Promise<RepoStats | null> {
	try {
		validateRepoIdentifier(repo);
		return await cachedJson(
			`repo-stats:${repo.toLowerCase()}`,
			3 * 3600,
			() => fetchRepoStatsUncached(repo),
			stats => stats.commitsCount !== null,
		);
	} catch {
		// Don't cache failures — returning null here keeps the cache clean so
		// transient errors (rate limits, missing token, etc.) recover next call.
		console.warn("[GitHub repository] Could not load repository statistics.");
		return null;
	}
}
