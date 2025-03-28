"use client";

import { useResize } from '@/lib/hooks/useResize';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useState } from 'react';
import DotMatrixImage from '@/components/dotted/DotMatrixImage';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useMounted } from '@/lib/hooks/useMounted';

function HeaderClient() {
	const { scrollY } = useScroll();
	const { windowHeight, windowWidth } = useResize();
	const [dotSize, setDotSize] = useState(1);
	const [dotSpacing, setDotSpacing] = useState(1);

	// useMotionValueEvent(scrollY, "change", (latest) => {
	// 	const SIZE_MIN = 1;
	// 	const SIZE_MAX = 5;
	// 	const SPACING_MIN = 1;
	// 	const SPACING_MAX = 5;

	// 	// as 'latest' increases, 'v' decreases from 5 to 1
	// 	const size_v = SIZE_MAX - (latest / windowHeight) * SIZE_MAX;
	// 	const size_r = Math.max(SIZE_MIN, Math.min(SIZE_MAX, size_v));

	// 	// as 'latest' increases, 'v' decreases from 5 to 1
	// 	const spacing_v = SPACING_MAX - (latest / windowHeight) * SPACING_MAX;
	// 	const spacing_r = Math.max(SPACING_MIN, Math.min(SPACING_MAX, spacing_v));

	// 	setDotSize(size_r);
	// 	setDotSpacing(spacing_r);
	// });

	const containerWidth = Math.min(Math.max(windowWidth, 900), 896);

	return (
		<DotMatrixImage
			// src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1601-9yuID5GpoyFr3s9DYcDfmHnjH7CGp3.jpeg"
			src="https://avatars.githubusercontent.com/u/6310278?v=4"
			width={Math.round(containerWidth / 5)}
			height={Math.round(containerWidth / 5)}
			dotSize={dotSize}
			dotSpacing={dotSpacing}
			samplingFactor={3}
			backgroundColor={'transparent'} // Set to null for transparent background
			hoverEffect={true}
			hoverRadius={55}
			hoverScale={1.6}
			hoverBrightness={1}
			hoverSaturation={1.3}
			radialFade={true}
			radialFadeStrength={1}
			radialFadeRadius={0.7}
			radialFadeCurve="exponential"
			animationDuration={300} // Animation duration in milliseconds
		/>
	)
}

export default function HeaderClientMain() {
	const theme = useTheme().resolvedTheme ?? 'light';
	const mounted = useMounted();

	const photograph = (
		<motion.div
			className="img-tape img-tape--3 mb-4"
			style={{ opacity: 0, rotateZ: '0deg' }}
			animate={{ opacity: 1, rotateZ: '7deg' }}
			initial={{ rotateZ: '0deg' }}
		>
			<Image
				src={"/drawn-panther.png"}
				alt="Knosh Logo"
				className='z-1 w-52 h-42'
				width={192}
				height={192}
				priority
			/>
			<div />
		</motion.div>
	);

	const globe = (
		<motion.div
			className='flex items-center justify-center relative aspect-square h-44'
			style={{ opacity: 0 }}
			animate={{ opacity: 1 }}
		>
			<div
				className="z-0 mix-blend-color-dodge bg-muted/20 backdrop-blur-2xl w-46 h-46 rounded-full absolute shadow-2xl border border-muted"
			/>
			<Image
				src={"/drawn-profile2.png"}
				alt="Knosh Logo"
				className='z-1 rounded-full w-42 h-42'
				width={192}
				height={192}
				priority
			/>
		</motion.div>
	);

	if (!mounted) {
		return photograph;
	}

	return (
		<AnimatePresence >
			{theme === 'dark' ? globe : photograph}
		</AnimatePresence>
	)
}