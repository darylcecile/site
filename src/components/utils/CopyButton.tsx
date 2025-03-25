"use client";

import { cn } from "@/lib/utils";
import { CopyIcon } from "lucide-react";
import { type ComponentProps, useCallback, useEffect, useState } from "react";

type CopyButtonProps = ComponentProps<'button'> & {
	text?: string;
	clickedLabel?: string;
};

export function CopyButton({ text, ...props }: CopyButtonProps) {
	const [isClicked, setIsClicked] = useState(false);

	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(text);
			setIsClicked(true);
			setTimeout(() => {
				setIsClicked(false);
			}, 2000);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}, [text]);

	return (
		<button
			{...props}
			onClick={copyToClipboard}
			className={props.children ? props.className : cn('flex items-center gap-2', props.className)}
		>
			{props.children ?? (
				<>
					<CopyIcon className="w-4 h-4" />
					{isClicked ? 'Copied!' : 'Copy'}
				</>
			)}
		</button>
	);
}