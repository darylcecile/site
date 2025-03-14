import { Header } from '@/components/header/index';

export default function Page() {
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
		</div>
	)
}