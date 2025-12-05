// Minimal types based on GitHub's GraphQL response
export type ContributionDay = {
	date: string;
	count: number;
	color: string; // GitHub gives you a precomputed color
};

export type ContributionWeek = {
	contributionDays: ContributionDay[];
};

export type ContributionCalendar = {
	totalContributions: number;
	weeks: ContributionWeek[];
};

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTIONS_QUERY = `
  query ($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

export async function fetchGithubContributionCalendar(
	username: string,
	token: string,
	from: string,
	to: string
): Promise<ContributionCalendar> {
	const res = await fetch(GITHUB_GRAPHQL_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			query: CONTRIBUTIONS_QUERY,
			variables: { username, from, to },
		}),
	});

	if (!res.ok) {
		throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
	}

	const json = (await res.json()) as any;

	if (json.errors) {
		throw new Error(JSON.stringify(json.errors));
	}

	const calendar =
		json.data.user.contributionsCollection.contributionCalendar;

	const weeks: ContributionWeek[] = calendar.weeks.map((week: any) => ({
		contributionDays: week.contributionDays.map((day: any) => ({
			date: day.date,
			count: day.contributionCount,
			color: day.color,
		})),
	}));

	return {
		totalContributions: calendar.totalContributions,
		weeks,
	};
}

export function getLastYearRange() {
	const to = new Date();
	const from = new Date();
	from.setFullYear(to.getFullYear() - 1);
	from.setDate(1); // start from the 1st of the month

	const toStr = to.toISOString();
	const fromStr = from.toISOString();
	return { from: fromStr, to: toStr };
}
