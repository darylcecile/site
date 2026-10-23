export default function Mark({ size = 34 }: { size?: number }) {
	return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
		<path d="M5 20c5-8 13-12 23-8l7-5v26l-7-5C18 32 10 28 5 20Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
		<path d="M28 12c-3 5-3 11 0 16M11 20h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
	</svg>;
}
