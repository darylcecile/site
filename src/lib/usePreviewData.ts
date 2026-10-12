import { useEffect, useRef, useState } from "react";

type PreviewState<T> = {
	key: string;
	data: T | null;
	status: "idle" | "pending" | "success" | "error";
};

export function usePreviewData<T>(
	key: string,
	enabled: boolean,
	load: (key: string, signal: AbortSignal) => Promise<T | null>,
) {
	const [state, setState] = useState<PreviewState<T>>({ key, data: null, status: "idle" });
	const completed = useRef<{ key: string; data: T } | null>(null);

	useEffect(() => {
		if (!enabled) return;
		if (completed.current?.key === key) {
			setState({ key, data: completed.current.data, status: "success" });
			return;
		}
		const controller = new AbortController();
		setState({ key, data: null, status: "pending" });
		load(key, controller.signal).then(data => {
			if (controller.signal.aborted) return;
			if (data !== null) completed.current = { key, data };
			setState({ key, data, status: data === null ? "error" : "success" });
		}).catch(() => {
			if (!controller.signal.aborted) setState({ key, data: null, status: "error" });
		});
		return () => controller.abort();
	}, [key, enabled, load]);

	return state.key === key ? state : { key, data: null, status: enabled ? "pending" as const : "idle" as const };
}
