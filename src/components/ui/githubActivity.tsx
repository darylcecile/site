import type { ContributionCalendar, ContributionDay } from "../utils/githubContributions";
import { getGithubActivity } from "@/lib/server/previews.functions";
import { usePreviewData } from "@/lib/usePreviewData";
import { cn } from "@/lib/utils";

type GithubActivityHeatmapProps = {
	username: string;
	className?: string;
	enabled?: boolean;
};

const loadActivity = (username: string, signal: AbortSignal) => getGithubActivity({ data: username, signal });

export function GithubActivityHeatmap({
	username,
	className,
	enabled = true,
}: GithubActivityHeatmapProps) {
	const { data: calendar, status } = usePreviewData(username, enabled, loadActivity);

	if (!calendar) {
		return (
			<div className={cn("rounded-3xl border border-neutral-100 p-3 shadow-lg", className)} role="status">
				<p className={status === "error" ? "text-red-500" : "text-sm text-muted-foreground"}>
					{status === "error" ? "Failed to load GitHub activity." : "Loading GitHub activity…"}
				</p>
			</div>
		);
	}

	return (
		<section
			className={cn(className)}
			aria-label={`${username}'s GitHub contribution heatmap`}
		>
			<div className="overflow-x-auto rounded-3xl border [corner-shape:superellipse(1.2)] border-neutral-100 p-3 shadow-lg">
				<header className="mb-3 flex items-center justify-between">
					<span>
						<svg width="18" height="18" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="#1B1F23" />
						</svg>
					</span>
					<span className="text-sm opacity-70 mr-1">
						<strong>{calendar.totalContributions.toLocaleString()}</strong> contributions
					</span>
				</header>

				{/* heatmap grid */}
				<WeeklyChart calendar={calendar} />
			</div>
		</section>
	);
}

function toMonthWeeks(calendar: ContributionCalendar) {
	// Preserve the four activity buckets per month used by the compact heatmap.
	const monthMap: Record<string, ContributionDay[][]> = {};
	
	calendar.weeks.forEach(week => {
		week.contributionDays.forEach(day => {
			const month = day.date.slice(0, 7); // "YYYY-MM"
			const weekIndex = Math.floor(Number(day.date.slice(8, 10)) / 8);

			if (!monthMap[month]) {
				monthMap[month] = [[], [], [], []];
			}
			monthMap[month][weekIndex].push(day);
		});
	});

	return monthMap;
}

function WeeklyChart({ calendar }: { calendar: ContributionCalendar }) {
	const cal = toMonthWeeks(calendar);

	return (
		<div className="grid grid-flow-col auto-cols-min grid-rows-4 grid-cols-13 gap-1.5">
			{Object.values(cal).map((weeks, monthIndex) => {
				return weeks.map((week, weekIndex) => {
					if (week.length === 0) {
						return (
							<div
								key={`${monthIndex}-${weekIndex}-last`}
								style={{
									backgroundColor: "rgba(30, 41, 59, 0.6)",
									opacity: 0.1,
									gridRowStart: weekIndex + 1,
									gridColumnStart: monthIndex + 1,
									// @ts-ignore
									cornerShape: 'superellipse(1.4)',
								}}
								className="aspect-square flex-1 rounded-md"
							/>
						)
					}
					
					const day: ContributionDay = {
						date: week[0].date,
						count: week.reduce((total, day) => total + day.count, 0),
						color: week.toSorted((a, b) => (b.count ?? 0) - (a.count ?? 0))[0].color,
					}

					return (
						<div
							key={`${weekIndex}-${day.date}`}
							title={`${day.count} contributions on week starting ${day.date}`}
							style={{
								backgroundColor: day.color || "rgba(30, 41, 59, 0.6)",
								opacity: day.count === 0 ? 0.3 : 1,
								gridRowStart: weekIndex + 1,
								gridColumnStart: monthIndex + 1,
								// @ts-ignore
								cornerShape: 'superellipse(1.4)',
							}}
							className="aspect-square flex-1 rounded-md"
						/>
					)
				})
			})}
		</div>
	)
}
