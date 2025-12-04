"use client";

import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ViewTransition } from 'react'
import type { Project } from '@/lib/repo/projectsRepo';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);

const rainbowColors = [
	{ text: 'text-red-500', bg: 'focus-within:bg-red-500/10', var: '--color-red-500' },
	{ text: 'text-yellow-500', bg: 'focus-within:bg-yellow-500/10', var: '--color-yellow-500' },
	{ text: 'text-green-500', bg: 'focus-within:bg-green-500/10', var: '--color-green-500' },
	{ text: 'text-blue-500', bg: 'focus-within:bg-blue-500/10', var: '--color-blue-500' },
	{ text: 'text-indigo-500', bg: 'focus-within:bg-indigo-500/10', var: '--color-indigo-500' },
	{ text: 'text-purple-500', bg: 'focus-within:bg-purple-500/10', var: '--color-purple-500' },
	{ text: 'text-pink-500', bg: 'focus-within:bg-pink-500/10', var: '--color-pink-500' }
];

export default function ProjectsListItem(props: { project: Project, index: number }) {
	const { project, index: i } = props;

	const projectImage = !project.image ? undefined : (
		URL.canParse(project.image) ? project.image : `/images/projects/${project.image}`
	);

	return (
		<Link
			href={`/projects/${project.id}`}
			className={cn(
				"rounded-lg -mx-4 px-4 py-4 transition-all duration-300 ease-in-out",
				"hover:bg-muted/40 hover:backdrop-blur-2xl hover:backdrop-saturate-150",
				"outline-transparent cursor-pointer relative overflow-hidden group",
				"focus-visible:outline-2 focus-visible:outline-muted focus-visible:outline-offset-1",
				"focus-visible:bg-muted/40 focus-visible:backdrop-blur-2xl focus-visible:backdrop-saturate-150",
				"flex flex-row items-center gap-4"
			)}
		>
			<div className='grid grid-cols-1 h-25 flex-1'>
				<ViewTransition name={`projects-${project.id}`}>
					<h1 className="text-foreground text-lg">{project.name}</h1>
					<p className="text-foreground text-sm opacity-75">{project.startYear} - {project.endYear ?? 'Ongoing'}</p>
				</ViewTransition>
				<div className='flex flex-1 h-full' />
				<span className={cn('mt-auto text-foreground text-xs', rainbowColors[i % rainbowColors.length].text)}>Read more</span>
			</div>

			{projectImage && (
				<ViewTransition name={`projects-image-${project.id}`}>
					<img
						src={projectImage}
						alt={''}
						className="h-25 z-2 aspect-video object-cover rounded-sm saturate-0 group-hover:saturate-100 group-focus-within:saturate-100 bg-muted border border-border" />
				</ViewTransition>
			)}

			<div
				className={cn(
					'transition-all duration-300 ease-in-out z-1',
					'absolute w-full h-full top-0 left-0 blur-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
				)}
				style={{
					background: `linear-gradient(to bottom left, transparent 25%, transparent 75%, var(${rainbowColors[i % rainbowColors.length].var}) 100%)`,
				}}
			/>
		</Link>
	)
}
