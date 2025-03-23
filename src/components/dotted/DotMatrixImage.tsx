"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DotMatrixImageProps {
	src: string
	width?: number
	height?: number
	dotSize?: number
	dotSpacing?: number
	backgroundColor?: string | null
	className?: string
	hoverEffect?: boolean
	hoverRadius?: number
	hoverScale?: number
	hoverBrightness?: number
	hoverSaturation?: number
	radialFade?: boolean
	radialFadeStrength?: number
	radialFadeRadius?: number
	radialFadeCurve?: "linear" | "exponential" | "sharp"
	animationDuration?: number,
	samplingFactor?: number
	showControls?: boolean
}

interface Dot {
	x: number
	y: number
	r: number
	g: number
	b: number
	size: number
	opacity: number
	targetSize?: number
	originalSize?: number
}

export default function DotMatrixImage({
	src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1601-9yuID5GpoyFr3s9DYcDfmHnjH7CGp3.jpeg",
	width = 800,
	height = 600,
	dotSize: initialDotSize = 6,
	dotSpacing: initialDotSpacing = 2,
	samplingFactor: initialSamplingFactor = 4,
	backgroundColor = null, // Changed to null for transparent background
	className = "",
	hoverEffect = true,
	hoverRadius: initialHoverRadius = 50,
	hoverScale: initialHoverScale = 1.5,
	hoverBrightness: initialHoverBrightness = 1.2,
	hoverSaturation: initialHoverSaturation = 1.3,
	radialFade: initialRadialFade = true,
	radialFadeStrength: initialRadialFadeStrength = 1.0,
	radialFadeRadius: initialRadialFadeRadius = 0.7,
	radialFadeCurve: initialRadialFadeCurve = "exponential",
	animationDuration = 300, // Animation duration in milliseconds
	showControls = false
}: DotMatrixImageProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [dotSize, setDotSize] = useState(initialDotSize)
	const [dotSpacing, setDotSpacing] = useState(initialDotSpacing)
	const [samplingFactor, setSamplingFactor] = useState(initialSamplingFactor)
	const [enableHover, setEnableHover] = useState(hoverEffect)
	const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
	const [radialFade, setRadialFade] = useState(initialRadialFade)
	const [radialFadeStrength, setRadialFadeStrength] = useState(initialRadialFadeStrength)
	const [radialFadeRadius, setRadialFadeRadius] = useState(initialRadialFadeRadius)
	const [radialFadeCurve, setRadialFadeCurve] = useState<"linear" | "exponential" | "sharp">(initialRadialFadeCurve)
	const [useTransparentBg, setUseTransparentBg] = useState(backgroundColor === null)

	const [hoverRadius, setHoverRadius] = useState(hoverEffect ? initialHoverRadius : 0)
	const [hoverScale, setHoverScale] = useState(initialHoverScale)
	const [hoverBrightness, setHoverBrightness] = useState(initialHoverBrightness)
	const [hoverSaturation, setHoverSaturation] = useState(initialHoverSaturation)

	// Animation state
	const animationRef = useRef<number | null>(null)
	const animationStartTimeRef = useRef<number | null>(null)
	const previousDotSizeRef = useRef<number>(initialDotSize)
	const previousDotSpacingRef = useRef<number>(initialDotSpacing)
	const isAnimatingRef = useRef<boolean>(false)

	// Store dots data for hover effects
	const dotsRef = useRef<Dot[]>([])
	const imageDataRef = useRef<ImageData | null>(null)
	const canvasDimensionsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d", { alpha: true })
		if (!ctx) return

		setIsLoading(true)

		const img = new Image()
		img.crossOrigin = "anonymous" // Prevent CORS issues
		img.src = src

		img.onload = () => {
			// Calculate aspect ratio
			const aspectRatio = img.width / img.height

			// Set canvas dimensions based on the container size and aspect ratio
			let canvasWidth = width
			let canvasHeight = Math.floor(width / aspectRatio)

			// If calculated height exceeds the max height, adjust width to maintain aspect ratio
			if (canvasHeight > height) {
				canvasHeight = height
				canvasWidth = Math.floor(height * aspectRatio)
			}

			canvas.width = canvasWidth
			canvas.height = canvasHeight
			canvasDimensionsRef.current = { width: canvasWidth, height: canvasHeight }

			// Draw the original image (not visible to user, just for processing)
			ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

			// Store the image data for later use
			imageDataRef.current = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

			// Create dot matrix effect
			createDotMatrix(ctx, canvasWidth, canvasHeight)

			setIsLoading(false)
		}

		img.onerror = (e) => {
			console.error("Error loading image", e)
			setIsLoading(false)
		}
	}, [
		src,
		width,
		height,
		samplingFactor,
		backgroundColor,
		radialFade,
		radialFadeStrength,
		radialFadeRadius,
		radialFadeCurve,
		useTransparentBg,
	]);

	// update dotSize when initialDotSize changes
	useEffect(() => {
		setDotSize(initialDotSize);
		setDotSpacing(initialDotSpacing);
	}, [initialDotSize, initialDotSpacing])

	// Handle dot size and spacing changes with animation
	useEffect(() => {
		if (isLoading) return

		// If we're already animating, cancel the current animation
		if (animationRef.current !== null) {
			cancelAnimationFrame(animationRef.current)
			animationRef.current = null
		}

		// Start a new animation if dot size or spacing has changed
		if (previousDotSizeRef.current !== dotSize || previousDotSpacingRef.current !== dotSpacing) {
			startAnimation()
		}

		// Update previous values
		previousDotSizeRef.current = dotSize
		previousDotSpacingRef.current = dotSpacing
	}, [dotSize, dotSpacing, isLoading])

	const startAnimation = () => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d", { alpha: true })
		if (!ctx) return

		// Set animation start time
		animationStartTimeRef.current = performance.now()
		isAnimatingRef.current = true

		// Store the current dots with their current size
		const currentDots = dotsRef.current.map((dot) => ({
			...dot,
			originalSize: dot.size,
			targetSize: dotSize, // Set target size to the new dot size
		}))

		dotsRef.current = currentDots

		// Start the animation loop
		const animate = (timestamp: number) => {
			if (!animationStartTimeRef.current) {
				animationStartTimeRef.current = timestamp
			}

			const elapsed = timestamp - animationStartTimeRef.current
			const progress = Math.min(elapsed / animationDuration, 1)

			// Animate the dots
			animateDots(ctx, progress)

			// Continue animation if not complete
			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate)
			} else {
				// Animation complete
				animationRef.current = null
				animationStartTimeRef.current = null
				isAnimatingRef.current = false

				// Recreate the dot matrix with the final values
				const { width, height } = canvasDimensionsRef.current
				createDotMatrix(ctx, width, height)
			}
		}

		// Start the animation
		animationRef.current = requestAnimationFrame(animate)
	}

	const animateDots = (ctx: CanvasRenderingContext2D, progress: number) => {
		const { width, height } = canvasDimensionsRef.current

		// Use easeInOutCubic for smoother animation
		const easedProgress = easeInOutCubic(progress)

		// Clear canvas
		ctx.clearRect(0, 0, width, height)

		// If a background color is specified, fill the canvas
		if (backgroundColor && !useTransparentBg) {
			ctx.fillStyle = backgroundColor
			ctx.fillRect(0, 0, width, height)
		}

		// Calculate the current total size (dot size + spacing) based on animation progress
		const oldTotalSize = previousDotSizeRef.current + previousDotSpacingRef.current
		const newTotalSize = dotSize + dotSpacing
		const currentTotalSize = oldTotalSize + (newTotalSize - oldTotalSize) * easedProgress

		// Calculate center point for positioning
		const centerX = width / 2
		const centerY = height / 2

		// Draw each dot with interpolated size and position
		for (const dot of dotsRef.current) {
			// Calculate the original position ratio (0-1) from the center
			const originalX = dot.x
			const originalY = dot.y

			// Calculate position relative to center
			const relX = originalX - centerX
			const relY = originalY - centerY

			// Scale position based on the ratio of new to old total size
			const scaleRatio = currentTotalSize / oldTotalSize
			const newX = centerX + relX * scaleRatio
			const newY = centerY + relY * scaleRatio

			// Interpolate dot size
			const originalSize = dot.originalSize || previousDotSizeRef.current
			const targetSize = dot.targetSize || dotSize
			const currentSize = originalSize + (targetSize - originalSize) * easedProgress

			// Draw the dot at the interpolated position and size
			ctx.beginPath()
			ctx.arc(newX, newY, currentSize / 2, 0, Math.PI * 2)
			ctx.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${dot.opacity})`
			ctx.fill()
		}

		// If mouse is over, apply hover effects
		if (enableHover && mousePosition) {
			applyHoverEffects(ctx, mousePosition)
		}
	}

	// Easing function for smoother animation
	const easeInOutCubic = (t: number): number => {
		return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
	}

	// Handle mouse movement
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas || !enableHover) return

		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect()
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			setMousePosition({ x, y })
		}

		const handleMouseLeave = () => {
			setMousePosition(null)
		}

		canvas.addEventListener("mousemove", handleMouseMove)
		canvas.addEventListener("mouseleave", handleMouseLeave)

		return () => {
			canvas.removeEventListener("mousemove", handleMouseMove)
			canvas.removeEventListener("mouseleave", handleMouseLeave)
		}
	}, [enableHover])

	// Redraw canvas when mouse position changes
	useEffect(() => {
		if (!enableHover || !mousePosition || !canvasRef.current || dotsRef.current.length === 0 || isAnimatingRef.current)
			return

		const canvas = canvasRef.current
		const ctx = canvas.getContext("2d", { alpha: true })
		if (!ctx) return

		// Redraw the canvas with hover effects
		drawWithHoverEffects(ctx, mousePosition)
	}, [mousePosition, enableHover, hoverRadius, hoverScale, hoverBrightness, hoverSaturation, useTransparentBg])

	// Redraw when hover settings change
	useEffect(() => {
		if (!enableHover || !canvasRef.current || dotsRef.current.length === 0 || isAnimatingRef.current) return

		const canvas = canvasRef.current
		const ctx = canvas.getContext("2d", { alpha: true })
		if (!ctx) return

		if (mousePosition) {
			drawWithHoverEffects(ctx, mousePosition)
		} else {
			// If no mouse position, just redraw normally
			const { width, height } = canvasDimensionsRef.current
			createDotMatrix(ctx, width, height)
		}
	}, [enableHover, hoverRadius, hoverScale, hoverBrightness, hoverSaturation, useTransparentBg])

	// Apply fade curve based on the selected curve type
	const applyFadeCurve = (normalizedDistance: number): number => {
		// Adjust distance based on fade radius (smaller radius = faster fade)
		const adjustedDistance = normalizedDistance / radialFadeRadius

		// Apply different curve types
		switch (radialFadeCurve) {
			case "linear":
				// Linear falloff
				return Math.min(1, adjustedDistance)
			case "exponential":
				// Exponential falloff (squared)
				return Math.min(1, adjustedDistance * adjustedDistance)
			case "sharp":
				// Sharp falloff (cubic)
				return Math.min(1, adjustedDistance * adjustedDistance * adjustedDistance)
			default:
				return Math.min(1, adjustedDistance)
		}
	}

	const createDotMatrix = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
		// Get image data
		const imageData = imageDataRef.current || ctx.getImageData(0, 0, canvasWidth, canvasHeight)
		const data = imageData.data

		// Clear canvas - use clearRect for transparency
		ctx.clearRect(0, 0, canvasWidth, canvasHeight)

		// If a background color is specified, fill the canvas
		if (backgroundColor && !useTransparentBg) {
			ctx.fillStyle = backgroundColor
			ctx.fillRect(0, 0, canvasWidth, canvasHeight)
		}

		// Calculate dot matrix dimensions
		const totalDotSize = dotSize + dotSpacing
		const cols = Math.floor(canvasWidth / totalDotSize)
		const rows = Math.floor(canvasHeight / totalDotSize)

		// Calculate center point for radial fade
		const centerX = canvasWidth / 2
		const centerY = canvasHeight / 2

		// Calculate max distance from center (for normalization)
		const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

		// Store dots for hover effects
		const dots: Dot[] = []

		// Draw dots
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				// Sample pixel from original image
				const pixelX = Math.floor((x * totalDotSize * samplingFactor) / samplingFactor)
				const pixelY = Math.floor((y * totalDotSize * samplingFactor) / samplingFactor)

				// Get pixel index in the image data array
				const i = (pixelY * canvasWidth + pixelX) * 4

				// Get RGB values
				const r = data[i]
				const g = data[i + 1]
				const b = data[i + 2]
				const a = data[i + 3]

				// Skip transparent pixels
				if (a < 128) continue

				// Calculate dot position
				const dotX = x * totalDotSize + dotSize / 2
				const dotY = y * totalDotSize + dotSize / 2

				// Calculate opacity based on distance from center (if radial fade is enabled)
				let opacity = 1
				if (radialFade) {
					const dx = dotX - centerX
					const dy = dotY - centerY
					const distance = Math.sqrt(dx * dx + dy * dy)
					const normalizedDistance = distance / maxDistance

					// Apply the selected fade curve
					const fadeAmount = applyFadeCurve(normalizedDistance)

					// Apply fade strength
					opacity = 1 - fadeAmount * radialFadeStrength
					opacity = Math.max(0, Math.min(1, opacity)) // Clamp between 0 and 1
				}

				// Store dot data
				dots.push({
					x: dotX,
					y: dotY,
					r,
					g,
					b,
					size: dotSize,
					opacity,
				})

				// Draw dot with opacity
				ctx.beginPath()
				ctx.arc(dotX, dotY, dotSize / 2, 0, Math.PI * 2)
				ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
				ctx.fill()
			}
		}

		// Store dots for later use
		dotsRef.current = dots
	}

	const drawWithHoverEffects = (ctx: CanvasRenderingContext2D, mousePos: { x: number; y: number }) => {
		const { width, height } = canvasDimensionsRef.current

		// Clear canvas - use clearRect for transparency
		ctx.clearRect(0, 0, width, height)

		// If a background color is specified, fill the canvas
		if (backgroundColor && !useTransparentBg) {
			ctx.fillStyle = backgroundColor
			ctx.fillRect(0, 0, width, height)
		}

		// Draw each dot with potential hover effect
		for (const dot of dotsRef.current) {
			// Calculate distance from mouse to dot center
			const dx = mousePos.x - dot.x
			const dy = mousePos.y - dot.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			// Apply hover effect based on distance
			if (distance <= hoverRadius) {
				// Calculate effect strength (1 at center, 0 at radius)
				const strength = 1 - distance / hoverRadius

				// Apply size scaling
				const scaleFactor = 1 + (hoverScale - 1) * strength
				const newSize = dot.size * scaleFactor

				// Apply color enhancement
				const brightnessBoost = (hoverBrightness - 1) * strength
				const saturationBoost = (hoverSaturation - 1) * strength

				// Convert RGB to HSL for better color manipulation
				const [h, s, l] = rgbToHsl(dot.r, dot.g, dot.b)

				// Increase saturation and brightness
				const newS = Math.min(1, s * (1 + saturationBoost))
				const newL = Math.min(1, l * (1 + brightnessBoost))

				// Convert back to RGB
				const [r, g, b] = hslToRgb(h, newS, newL)

				// Draw enhanced dot with original opacity
				ctx.beginPath()
				ctx.arc(dot.x, dot.y, newSize / 2, 0, Math.PI * 2)
				ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dot.opacity})`
				ctx.fill()
			} else {
				// Draw normal dot with original opacity
				ctx.beginPath()
				ctx.arc(dot.x, dot.y, dot.size / 2, 0, Math.PI * 2)
				ctx.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${dot.opacity})`
				ctx.fill()
			}
		}
	}

	// Apply hover effects during animation
	const applyHoverEffects = (ctx: CanvasRenderingContext2D, mousePos: { x: number; y: number }) => {
		// This is a simplified version just for animation - it applies hover effects on top of the animated dots
		for (const dot of dotsRef.current) {
			// Calculate distance from mouse to dot center
			const dx = mousePos.x - dot.x
			const dy = mousePos.y - dot.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			// Apply hover effect based on distance
			if (distance <= hoverRadius) {
				// Calculate effect strength (1 at center, 0 at radius)
				const strength = 1 - distance / hoverRadius

				// Apply color enhancement
				const brightnessBoost = (hoverBrightness - 1) * strength
				const saturationBoost = (hoverSaturation - 1) * strength

				// Convert RGB to HSL for better color manipulation
				const [h, s, l] = rgbToHsl(dot.r, dot.g, dot.b)

				// Increase saturation and brightness
				const newS = Math.min(1, s * (1 + saturationBoost))
				const newL = Math.min(1, l * (1 + brightnessBoost))

				// Convert back to RGB
				const [r, g, b] = hslToRgb(h, newS, newL)

				// Draw a highlight over the dot
				ctx.beginPath()
				ctx.arc(dot.x, dot.y, (dot.size * (1 + (hoverScale - 1) * strength)) / 2, 0, Math.PI * 2)
				ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dot.opacity})`
				ctx.fill()
			}
		}
	}

	// Helper function to convert RGB to HSL
	const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
		r /= 255
		g /= 255
		b /= 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		let h = 0
		let s = 0
		const l = (max + min) / 2

		if (max !== min) {
			const d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0)
					break
				case g:
					h = (b - r) / d + 2
					break
				case b:
					h = (r - g) / d + 4
					break
			}

			h /= 6
		}

		return [h, s, l]
	}

	// Helper function to convert HSL to RGB
	const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
		let r
		let g
		let b

		if (s === 0) {
			r = g = b = l // achromatic
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1
				if (t > 1) t -= 1
				if (t < 1 / 6) return p + (q - p) * 6 * t
				if (t < 1 / 2) return q
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
				return p
			}

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s
			const p = 2 * l - q

			r = hue2rgb(p, q, h + 1 / 3)
			g = hue2rgb(p, q, h)
			b = hue2rgb(p, q, h - 1 / 3)
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
	}

	if (!showControls) {
		return (
			<div className="space-y-6">
				<div className="relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-background/80">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					)}
					<canvas ref={canvasRef} className="mx-auto rounded-md" />
				</div>
			</div>
		)
	}

	return (
		<Card className={`p-6 ${className}`}>
			<div className="space-y-6">
				<div className="relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-background/80">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					)}
					<canvas ref={canvasRef} className="mx-auto rounded-md shadow-md" />
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="dot-size">Dot Size</Label>
							<span className="text-sm text-muted-foreground">{dotSize}px</span>
						</div>
						<Slider
							id="dot-size"
							min={2}
							max={12}
							step={1}
							value={[dotSize]}
							onValueChange={(value) => setDotSize(value[0])}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="dot-spacing">Dot Spacing</Label>
							<span className="text-sm text-muted-foreground">{dotSpacing}px</span>
						</div>
						<Slider
							id="dot-spacing"
							min={0}
							max={8}
							step={1}
							value={[dotSpacing]}
							onValueChange={(value) => setDotSpacing(value[0])}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="sampling-factor">Sampling Detail</Label>
							<span className="text-sm text-muted-foreground">{samplingFactor}x</span>
						</div>
						<Slider
							id="sampling-factor"
							min={1}
							max={8}
							step={1}
							value={[samplingFactor]}
							onValueChange={(value) => setSamplingFactor(value[0])}
						/>
					</div>

					<div className="space-y-4 pt-2 border-t">
						<div className="flex items-center justify-between">
							<Label htmlFor="transparent-bg">Transparent Background</Label>
							<Switch id="transparent-bg" checked={useTransparentBg} onCheckedChange={setUseTransparentBg} />
						</div>
					</div>

					<div className="space-y-4 pt-2 border-t">
						<div className="flex items-center justify-between">
							<Label htmlFor="radial-fade">Radial Fade Effect</Label>
							<Switch id="radial-fade" checked={radialFade} onCheckedChange={setRadialFade} />
						</div>

						{radialFade && (
							<>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="radial-fade-strength">Fade Strength</Label>
										<span className="text-sm text-muted-foreground">{Math.round(radialFadeStrength * 100)}%</span>
									</div>
									<Slider
										id="radial-fade-strength"
										min={0.1}
										max={1.5}
										step={0.05}
										value={[radialFadeStrength]}
										onValueChange={(value) => setRadialFadeStrength(value[0])}
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="radial-fade-radius">Fade Radius</Label>
										<span className="text-sm text-muted-foreground">{Math.round(radialFadeRadius * 100)}%</span>
									</div>
									<Slider
										id="radial-fade-radius"
										min={0.1}
										max={1}
										step={0.05}
										value={[radialFadeRadius]}
										onValueChange={(value) => setRadialFadeRadius(value[0])}
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="radial-fade-curve">Fade Curve</Label>
									</div>
									<Select
										value={radialFadeCurve}
										onValueChange={(value) => setRadialFadeCurve(value as "linear" | "exponential" | "sharp")}
									>
										<SelectTrigger id="radial-fade-curve">
											<SelectValue placeholder="Select fade curve" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="linear">Linear (Gradual)</SelectItem>
											<SelectItem value="exponential">Exponential (Medium)</SelectItem>
											<SelectItem value="sharp">Sharp (Dramatic)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</>
						)}
					</div>

					<div className="space-y-4 pt-2 border-t">
						<div className="flex items-center justify-between">
							<Label htmlFor="enable-hover">Enable Hover Effects</Label>
							<Switch id="enable-hover" checked={enableHover} onCheckedChange={setEnableHover} />
						</div>

						{enableHover && (
							<>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="hover-radius">Hover Radius</Label>
										<span className="text-sm text-muted-foreground">{hoverRadius}px</span>
									</div>
									<Slider
										id="hover-radius"
										min={20}
										max={100}
										step={5}
										value={[hoverRadius]}
										onValueChange={(value) => {
											const newValue = value[0]
											setHoverRadius(newValue)
										}}
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="hover-scale">Size Increase</Label>
										<span className="text-sm text-muted-foreground">{Math.round((hoverScale - 1) * 100)}%</span>
									</div>
									<Slider
										id="hover-scale"
										min={1}
										max={2}
										step={0.1}
										value={[hoverScale]}
										onValueChange={(value) => {
											const newValue = value[0]
											setHoverScale(newValue)
										}}
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="hover-brightness">Brightness Boost</Label>
										<span className="text-sm text-muted-foreground">{Math.round((hoverBrightness - 1) * 100)}%</span>
									</div>
									<Slider
										id="hover-brightness"
										min={1}
										max={1.5}
										step={0.05}
										value={[hoverBrightness]}
										onValueChange={(value) => {
											const newValue = value[0]
											setHoverBrightness(newValue)
										}}
									/>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="hover-saturation">Saturation Boost</Label>
										<span className="text-sm text-muted-foreground">{Math.round((hoverSaturation - 1) * 100)}%</span>
									</div>
									<Slider
										id="hover-saturation"
										min={1}
										max={1.5}
										step={0.05}
										value={[hoverSaturation]}
										onValueChange={(value) => {
											const newValue = value[0]
											setHoverSaturation(newValue)
										}}
									/>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</Card>
	)
}

