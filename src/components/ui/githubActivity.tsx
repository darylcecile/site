import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
	type ContributionCalendar,
	ContributionDay,
	fetchGithubContributionCalendar,
	getLastYearRange,
} from "../utils/githubContributions";
import { cn } from "@/lib/utils";

type GithubActivityHeatmapProps = {
	username: string;
	className?: string;
};

dayjs.extend(isoWeek);

async function fetchCalendar(username: string): Promise<ContributionCalendar> {
	const token = process.env.GITHUB_TOKEN;

	if (!token) {
		throw new Error("GITHUB_TOKEN is not configured.");
	}

	const { from, to } = getLastYearRange();
	return fetchGithubContributionCalendar(username, token, from, to);
}

export async function GithubActivityHeatmap({
	username,
	className,
}: GithubActivityHeatmapProps) {
	"use cache";
	
	let calendar: ContributionCalendar | null = null;
	let error: string | null = null;

	try {
		calendar = await fetchCalendar(username);
	} catch (err) {
		console.error(err);
		error = "Failed to load GitHub activity.";
	}

	if (error || !calendar) {
		return (
			<div className={className}>
				<p className="text-red-500">{error ?? "No data."}</p>
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
							<path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="#1B1F23" />
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
	//  converts to map of months -> 5 weeks each 
	const monthMap: { [month: string]: (ContributionDay | null)[][] } = {};
	
	calendar.weeks.forEach(week => {
		week.contributionDays.forEach(day => {
			const month = day.date.slice(0, 7); // "YYYY-MM"
			const weekN = Math.floor(dayjs(day.date).date() / 8) + 1; // 1-based week number in month

			if (!monthMap[month]) {
				monthMap[month] = [];
			}

			if (!monthMap[month][weekN - 1]) {
				monthMap[month][weekN - 1] = [day];
			} else {
				// merge days into existing week slot
				monthMap[month][weekN - 1].push(day);
			}
		});
	});

	return monthMap;
}

function DailyChart({ calendar }: { calendar: ContributionCalendar }) {
	return (
		<div className="grid grid-flow-col auto-cols-min grid-rows-7 gap-[3px]">
			{calendar.weeks.map((week, weekIndex) =>
				week.contributionDays.map((day, dayIndex) => (
					<div
						key={`${weekIndex}-${day.date}`}
						title={`${day.count} contributions on ${day.date}`}
						style={{
							backgroundColor: day.color || "rgba(30, 41, 59, 0.6)",
							opacity: day.count === 0 ? 0.3 : 1,
							gridRowStart: dayIndex + 1, // 1..7 (Sun..Sat)
							// @ts-ignore
							cornerShape: 'superellipse(0.4)',
						}}
						className="h-2.5 w-2.5 rounded-[2px]"
					/>
				))
			)}
		</div>
	)
}

function WeeklyChart({ calendar }: { calendar: ContributionCalendar }) {
	const cal = toMonthWeeks(calendar);
	const sum = (arg) => arg.reduce((a, b) => a + b, 0);

	return (
		<div className="grid grid-flow-col auto-cols-min grid-rows-4 grid-cols-13 gap-[3px]">
			{Object.values(cal).map((weeks, monthIndex) => {
				// const weeks = month.length < 5 ? [...month, []] : month;
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
									cornerShape: 'superellipse(1.2)',
								}}
								className="h-4 w-4 rounded-sm"
							/>
						)
					}
					
					const day: ContributionDay = {
						date: week[0].date,
						count: sum(week.map(d => d.count ?? 0)),
						color: week[0].color,
					}

					return (
						<div
							key={`${weekIndex}-${day.date}`}
							title={`${day.count} contributions on ${day.date}`}
							style={{
								backgroundColor: day.color || "rgba(30, 41, 59, 0.6)",
								opacity: day.count === 0 ? 0.3 : 1,
								gridRowStart: weekIndex + 1,
								gridColumnStart: monthIndex + 1,
								// @ts-ignore
								cornerShape: 'superellipse(1.2)',
							}}
							className="h-4 w-4 rounded-sm"
						/>
					)
				})
			})}
		</div>
	)
}