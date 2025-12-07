import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function MFPostArticle(props:ComponentProps<"article">) {
	return (
		<article {...props} className={cn(props.className, 'h-entry')}/>
	)
}

export function MFPostTitle(props:ComponentProps<"h1">) {
	return (
		<h1 {...props} className={cn(props.className, 'p-name')}/>
	)
}

export function MFPostContent(props:ComponentProps<"div">) {
	return (
		<div {...props} className={cn(props.className, 'e-content')}/>
	)
}

export function MFPostAuthor(props:ComponentProps<"a">) {
	return (
		<a {...props} className={cn(props.className, 'p-author h-card')}/>
	)
}

export function MFPostSummary(props:ComponentProps<"p">) {
	return (
		<p {...props} className={cn(props.className, 'p-summary')}/>
	)
}

export function MFPostPublished(props:ComponentProps<"time">) {
	return (
		<time {...props} className={cn(props.className, 'dt-published')}/>
	)
}

export function MFPostUpdated(props:ComponentProps<"time">) {
	return (
		<time {...props} className={cn(props.className, 'dt-updated')}/>
	)
}