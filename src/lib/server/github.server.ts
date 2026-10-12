import { env } from "cloudflare:workers";
import type { ContributionCalendar, ContributionDay } from "@/components/utils/githubContributions";
import { cachedJson } from "./cache.server";
import type { GitHubProfile } from "./preview-types";

const ownerProfileFallback: GitHubProfile = {
	login: "darylcecile",
	name: "Daryl",
	avatar_url: "https://avatars.githubusercontent.com/u/6310278?v=4",
	bio: null,
	followers: 8,
	following: 18,
	public_repos: 70,
	html_url: "https://github.com/darylcecile",
	site_admin: true,
	location: null,
	created_at: "2014-01-03T10:22:48Z",
};

function githubHeaders(): Record<string, string> {
	const token = (env as { GITHUB_TOKEN?: string }).GITHUB_TOKEN;
	return {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "darylcecile.net",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}

export function fetchGithub(path: string, init?: RequestInit): Promise<Response> {
	const headers = new Headers(githubHeaders());
	new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
	return fetch(`https://api.github.com${path}`, {
		...init,
		headers,
		signal: AbortSignal.timeout(5000),
	});
}

export async function loadGithubProfile(handle: string): Promise<GitHubProfile | null> {
	try {
		return await cachedJson(`github-profile:${handle.toLowerCase()}`, 14 * 86400, async () => {
			const response = await fetchGithub(`/users/${handle}`);
			if (!response.ok) {
				await response.body?.cancel();
				throw new Error("GitHub profile request failed.");
			}
			const profile = await response.json() as GitHubProfile;
			// Only return the fields displayed by the public card.
			return {
				login: profile.login,
				name: profile.name,
				avatar_url: profile.avatar_url,
				bio: profile.bio,
				followers: profile.followers,
				following: profile.following,
				public_repos: profile.public_repos,
				html_url: profile.html_url,
				site_admin: profile.site_admin,
				location: profile.location,
				created_at: profile.created_at,
			};
		});
	} catch {
		console.warn("[GitHub profile] Upstream request failed.");
		return handle.toLowerCase() === ownerProfileFallback.login ? ownerProfileFallback : null;
	}
}

const contributionsQuery = `
	query ($username: String!, $from: DateTime!, $to: DateTime!) {
		user(login: $username) {
			contributionsCollection(from: $from, to: $to) {
				contributionCalendar {
					totalContributions
					weeks { contributionDays { date contributionCount color } }
				}
			}
		}
	}
`;

type GraphqlCalendar = {
	totalContributions: number;
	weeks: { contributionDays: (Omit<ContributionDay, "count"> & { contributionCount: number })[] }[];
};

export async function loadGithubActivity(username: string): Promise<ContributionCalendar | null> {
	try {
		return await cachedJson(`github-activity:${username.toLowerCase()}`, 3600, async () => {
			if (!(env as { GITHUB_TOKEN?: string }).GITHUB_TOKEN) {
				throw new Error("GitHub activity requires a token.");
			}
			const to = new Date();
			const from = new Date(to);
			from.setFullYear(from.getFullYear() - 1);
			from.setDate(from.getDate() + 1);
			const response = await fetchGithub("/graphql", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: contributionsQuery, variables: { username, from: from.toISOString(), to: to.toISOString() } }),
			});
			if (!response.ok) {
				await response.body?.cancel();
				throw new Error("GitHub activity request failed.");
			}
			const result = await response.json() as {
				data?: { user?: { contributionsCollection: { contributionCalendar: GraphqlCalendar } } };
				errors?: unknown[];
			};
			const calendar = result.data?.user?.contributionsCollection.contributionCalendar;
			if (result.errors?.length || !calendar) throw new Error("GitHub activity is unavailable.");
			return {
				totalContributions: calendar.totalContributions,
				weeks: calendar.weeks.map(week => ({
					contributionDays: week.contributionDays.map(day => ({ date: day.date, count: day.contributionCount, color: day.color })),
				})),
			};
		});
	} catch {
		console.warn("[GitHub activity] Could not load contribution calendar.");
		return null;
	}
}
