import { useEffect, useState } from "react";

export type BlurPerformanceMode = "blur" | "gradient";

const STORAGE_KEY = "blur-perf-mode";

/**
 * Number of frame deltas to collect (while scrolling) before making a verdict.
 * ~30 frames is roughly half a second of continuous scrolling at 60fps.
 */
const TARGET_SAMPLES = 30;

/**
 * A frame longer than this (ms) is treated as "dropped" — ~42fps or worse.
 * 60fps = ~16.7ms; we allow slack before counting a frame as janky.
 */
const LONG_FRAME_MS = 24;

/**
 * If at least this fraction of sampled frames are long, the device can't keep
 * up with the live `backdrop-filter` blur and we fall back to the gradient.
 */
const JANK_RATIO = 0.25;

/** Stop a sampling burst this long (ms) after the last scroll event. */
const SCROLL_IDLE_MS = 150;

/**
 * Decides whether the live `backdrop-filter` blur is smooth enough on the
 * current device, by measuring real frame times *while the user scrolls*.
 *
 * Why measure during scroll: `backdrop-filter: blur()` is only re-rasterized
 * when the content behind it changes. At rest the GPU does no work and every
 * device looks fast, so idle FPS sampling can't detect the jank. The cost only
 * appears during scroll/repaint — exactly when we sample here.
 *
 * Starts optimistically on "blur". The first time the user scrolls, it samples
 * consecutive animation-frame deltas; if too many frames are dropped it switches
 * to "gradient" permanently and caches the verdict in `sessionStorage` so later
 * navigations skip re-measuring (and avoid a blur→gradient flash). Capable
 * devices (Apple, desktop, fast Android) stay on "blur".
 */
export default function useBlurPerformanceMode(): BlurPerformanceMode {
	const [mode, setMode] = useState<BlurPerformanceMode>("blur");

	useEffect(() => {
		if (typeof window === "undefined") return;

		// Use a cached verdict from earlier in the session if we have one.
		let cached: string | null = null;
		try {
			cached = window.sessionStorage.getItem(STORAGE_KEY);
		} catch {
			// sessionStorage can throw (private mode / disabled); ignore.
		}
		if (cached === "gradient" || cached === "blur") {
			setMode(cached);
			return;
		}

		const samples: number[] = [];
		let rafId: number | null = null;
		let scrollTimer: ReturnType<typeof setTimeout> | null = null;
		let lastTs = 0;
		let finished = false;

		const persist = (verdict: BlurPerformanceMode) => {
			try {
				window.sessionStorage.setItem(STORAGE_KEY, verdict);
			} catch {
				// ignore storage failures
			}
		};

		const stopRaf = () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			lastTs = 0;
		};

		const cleanup = () => {
			finished = true;
			stopRaf();
			if (scrollTimer !== null) clearTimeout(scrollTimer);
			window.removeEventListener("scroll", onScroll);
		};

		const evaluate = () => {
			const longFrames = samples.filter((d) => d > LONG_FRAME_MS).length;
			const ratio = longFrames / samples.length;
			const verdict: BlurPerformanceMode =
				ratio >= JANK_RATIO ? "gradient" : "blur";
			persist(verdict);
			setMode(verdict);
			cleanup();
		};

		const onFrame = (ts: number) => {
			if (finished) return;
			// Skip the first frame of a burst: its delta includes idle time.
			if (lastTs !== 0) {
				samples.push(ts - lastTs);
				if (samples.length >= TARGET_SAMPLES) {
					evaluate();
					return;
				}
			}
			lastTs = ts;
			rafId = requestAnimationFrame(onFrame);
		};

		const onScroll = () => {
			if (finished) return;
			if (rafId === null) {
				lastTs = 0;
				rafId = requestAnimationFrame(onFrame);
			}
			if (scrollTimer !== null) clearTimeout(scrollTimer);
			// Pause sampling shortly after scrolling stops; resume on next scroll.
			scrollTimer = setTimeout(stopRaf, SCROLL_IDLE_MS);
		};

		window.addEventListener("scroll", onScroll, { passive: true });

		return cleanup;
	}, []);

	return mode;
}
