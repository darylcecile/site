

export default function Footer() {

	return (
		<footer className="w-full bg-background text-center py-8 pb-28 opacity-65">
			<div className="max-w-2xl mx-auto gap-8 flex flex-col border-t border-border/50 pt-12">
				<p>Daryl Cecile © {new Date().getFullYear()}, Inc. All rights reserved.</p>
			</div>
		</footer>
	)
}