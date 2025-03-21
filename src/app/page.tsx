import { Header } from '@/components/header/index';
import { NotesList } from '@/components/notes/NotesList';
import { getAllNotesDataSorted } from '@/lib/repo/notesRepo';
import Link from 'next/link';

export default function Page() {
	const notesCount = getAllNotesDataSorted(false).length;
	return (
		<div>
			{/* <div className="max-w-4xl mx-auto">
				<DotMatrixImage
					src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1601-9yuID5GpoyFr3s9DYcDfmHnjH7CGp3.jpeg"
					width={800}
					height={600}
					dotSize={5}
					dotSpacing={1}
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
					showControls={false}
				/>
			</div> */}
			<Header />
			<div className='px-8'>
				<NotesList maxItems={7} />
				<div className='max-w-2xl mx-auto w-full border-t border-border/50 mb-10 flex items-center justify-end'>
					<p className='text-sm pt-4'>
						Looking for more? <Link className='text-foreground/50 hover:underline underline-offset-2' href="/notes">View all {notesCount} notes</Link> →
					</p>
				</div>
			</div>
		</div>
	)
}