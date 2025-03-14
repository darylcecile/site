import { useEffect, useState } from "react";

export function useResize() {
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	useEffect(() => {
		function handler() {
			setWidth(window.innerWidth);
			setHeight(window.innerHeight);
		}

		handler();

		window.addEventListener('resize', handler);
		return () => window.removeEventListener('resize', handler);
	}, []);

	return {
		windowWidth: width,
		windowHeight: height
	}
}