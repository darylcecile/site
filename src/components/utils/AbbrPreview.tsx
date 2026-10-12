import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { getLinkMetadata } from '@/lib/server/previews.functions';
import { usePreviewData } from '@/lib/usePreviewData';
import { cn } from '@/lib/utils';
import { useState, type PropsWithChildren } from 'react';
import FancyLink from './FancyLink';

type AbbrPreviewProps = PropsWithChildren<{
	title: string;
	image?: string;
	favicon?: string;
	link?: string;
	description?: string;
	hideFavicon?: boolean;
	faviconUrl?: string;
	className?: string;
	manualColor?: boolean
}>

const loadMetadata = (url: string, signal: AbortSignal) => getLinkMetadata({ data: url, signal });

export function AbbrPreview(props: AbbrPreviewProps) {
	const [open, setOpen] = useState(false);
	const { data, status } = usePreviewData(props.link ?? '', open && Boolean(props.link), loadMetadata);
	const title = data?.title || props.title;
	const description = data?.description ?? props.description;

	return (
		<HoverCard open={open} onOpenChange={setOpen} openDelay={100} closeDelay={200}>
			<HoverCardTrigger asChild>
				{props.link ? (
					<FancyLink
						href={props.link}
						className={cn('decoration-dotted', props.className)}
						hideFavicon={props.hideFavicon}
						faviconUrlOverride={props.faviconUrl}
						manualColor={props.manualColor}
					>{props.children}</FancyLink>
				) : (
					<span className={cn(
						'underline decoration-dotted underline-offset-4',
						props.className
					)} tabIndex={0}>{props.children}</span>
				)}
			</HoverCardTrigger>
			<HoverCardContent
				className={cn(
					"w-80 overflow-hidden border-none shadow-lg rounded-2xl p-2 flex flex-col",
					"bg-muted/20 backdrop-blur-2xl backdrop-saturate-150",
				)}
				align="center"
			>
				{data?.image && (
					<img src={`/proxy?u=${encodeURIComponent(btoa(data.image))}`} className='bg-muted aspect-video w-full object-cover rounded-lg mb-2' alt="" />
				)}
				{title && (
					<p className='p-1 leading-5 pb-0 text-balance relative'>{title}</p>
				)}
				{description && <p className='p-1 text-sm text-muted-foreground'>{description}</p>}
				{props.link && !data && (
					<p className='p-1 text-sm text-muted-foreground' role="status">
						{status === 'error' ? 'Preview unavailable. You can still visit the link.' : 'Loading preview…'}
					</p>
				)}
			</HoverCardContent>
		</HoverCard>
	);
}
