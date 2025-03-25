"use client";

import { useMounted } from "@/lib/hooks/useMounted";
import { useTheme } from "next-themes"
import { useMemo } from "react";


export function ClientTheme() {
	const theme = useTheme();
	const mounted = useMounted();

	const bgColor = useMemo(() => {
		if (!mounted) return 'transparent';
		console.log('Changed theme to', theme.resolvedTheme);
		const color = window.getComputedStyle(document.documentElement).getPropertyValue('--background');
		return color;
	}, [theme, mounted]);

	return (
		<meta name="theme-color" content={bgColor} />
	)
}