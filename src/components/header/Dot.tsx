"use client"

import { useMounted } from "@/lib/hooks/useMounted"
import { clamp, motion, useScroll, useTransform } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"

interface DotImageBackgroundProps {
	src: string
	dotSize?: number
	dotSpacing?: number
	backgroundColor?: string
	imageWidth?: number
	imageHeight?: number
	imagePosition?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom"
	imageX?: number
	imageY?: number
	className?: string
}

interface Dot {
	x: number
	y: number
	originalX: number
	originalY: number
	vx: number
	vy: number
	color: string
}

export default function DotImageBackground({
	src,
	dotSize = 3,
	dotSpacing = 6,
	backgroundColor = "#000",
	imageWidth = 400,
	imageHeight = 400,
	imagePosition = "center",
	imageX = 0,
	imageY = 0,
	className = "",
}: DotImageBackgroundProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [dots, setDots] = useState<Dot[]>([])
	const [isHovering, setIsHovering] = useState(false)
	const [isImageLoaded, setIsImageLoaded] = useState(false)
	const animationRef = useRef<number>(0)
	const dotsRef = useRef<Dot[]>([])
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
	const [imageArea, setImageArea] = useState({ x: 0, y: 0, width: imageWidth, height: imageHeight })
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const mounted = useMounted();

	const scroll = useScroll({
		offset: ["start end", "end end"]
	});
	const winIn = useMemo(() => {
		if (typeof window === "undefined") return 1
		return Number.parseFloat((window.innerHeight / document.body.clientHeight).toFixed(1))
	}, [mounted]);
	console.log({ winIn })
	const opacity = useTransform(scroll.scrollYProgress, [0, 0.5], [1, 0]);

	// Handle resize
	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		handleResize()
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	// Calculate image position
	useEffect(() => {
		if (dimensions.width === 0 || dimensions.height === 0) return

		// Calculate the position based on the imagePosition prop
		let posX = 0
		let posY = 0

		switch (imagePosition) {
			case "center":
				posX = (dimensions.width - imageWidth) / 2
				posY = (dimensions.height - imageHeight) / 2
				break
			case "top-left":
				posX = 0
				posY = 0
				break
			case "top-right":
				posX = dimensions.width - imageWidth
				posY = 0
				break
			case "bottom-left":
				posX = 0
				posY = dimensions.height - imageHeight
				break
			case "bottom-right":
				posX = dimensions.width - imageWidth
				posY = dimensions.height - imageHeight
				break
			case "custom":
				posX = imageX === 0 ? (dimensions.width - imageWidth) / 2 : imageX
				posY = imageY === 0 ? (dimensions.height - imageHeight) / 2 : imageY
				break
		}

		setImageArea({
			x: posX,
			y: posY,
			width: imageWidth,
			height: imageHeight,
		})
	}, [dimensions, imagePosition, imageWidth, imageHeight, imageX, imageY])

	// Track mouse position
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePos({ x: e.clientX, y: e.clientY })

			// Check if mouse is within image bounds
			const isInBounds =
				e.clientX >= imageArea.x &&
				e.clientX <= imageArea.x + imageArea.width &&
				e.clientY >= imageArea.y &&
				e.clientY <= imageArea.y + imageArea.height

			setIsHovering(isInBounds)
		}

		window.addEventListener("mousemove", handleMouseMove)
		return () => window.removeEventListener("mousemove", handleMouseMove)
	}, [imageArea])

	// Load image and create dots
	useEffect(() => {
		if (dimensions.width === 0 || dimensions.height === 0) return

		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		// Set canvas dimensions to match the container
		canvas.width = dimensions.width
		canvas.height = dimensions.height

		const img = new Image()
		img.crossOrigin = "anonymous"
		img.src = src

		img.onload = () => {
			// Create a temporary canvas to draw the image
			const tempCanvas = document.createElement("canvas")
			tempCanvas.width = imageWidth
			tempCanvas.height = imageHeight
			const tempCtx = tempCanvas.getContext("2d")

			if (!tempCtx) return

			// Draw image to temp canvas
			tempCtx.drawImage(img, 0, 0, imageWidth, imageHeight)
			const imageData = tempCtx.getImageData(0, 0, imageWidth, imageHeight)
			const pixels = imageData.data

			// Create dots based on pixel data
			const newDots: Dot[] = []

			for (let y = 0; y < imageHeight; y += dotSpacing) {
				for (let x = 0; x < imageWidth; x += dotSpacing) {
					const i = (y * imageWidth + x) * 4

					// Skip transparent or nearly transparent pixels
					if (pixels[i + 3] < 50) continue

					// Get color
					const r = pixels[i]
					const g = pixels[i + 1]
					const b = pixels[i + 2]
					const a = pixels[i + 3] / 255

					// Skip very dark pixels against dark background
					if (backgroundColor === "#000" && r < 30 && g < 30 && b < 30) continue

					// Create dot with random initial position across the entire viewport
					const dot: Dot = {
						x: Math.random() * dimensions.width,
						y: Math.random() * dimensions.height,
						originalX: imageArea.x + x, // Position the image based on selected position
						originalY: imageArea.y + y,
						vx: (Math.random() - 0.5) * 2,
						vy: (Math.random() - 0.5) * 2,
						color: `rgba(${r}, ${g}, ${b}, ${a})`,
					}

					newDots.push(dot)
				}
			}

			setDots(newDots)
			dotsRef.current = newDots
			setIsImageLoaded(true)
		}

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [src, dotSpacing, backgroundColor, dimensions, imageWidth, imageHeight, imageArea])

	// Animation loop
	useEffect(() => {
		if (!isImageLoaded || dimensions.width === 0 || dimensions.height === 0) return

		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		const animate = () => {
			ctx.fillStyle = backgroundColor
			// ctx.fillRect(0, 0, dimensions.width, dimensions.height);
			ctx.clearRect(0, 0, dimensions.width, dimensions.height);

			// Update and draw dots
			dotsRef.current.forEach((dot) => {
				if (isHovering) {
					// Move towards original position when hovering
					const dx = dot.originalX - dot.x
					const dy = dot.originalY - dot.y
					dot.vx = dx * 0.1
					dot.vy = dy * 0.1
				} else {
					// Random movement when not hovering
					dot.vx += (Math.random() - 0.5) * 0.3
					dot.vy += (Math.random() - 0.5) * 0.3

					// Dampen velocity
					dot.vx *= 0.95
					dot.vy *= 0.95

					// Bounce off edges
					if (dot.x < 0 || dot.x > dimensions.width) dot.vx *= -1
					if (dot.y < 0 || dot.y > dimensions.height) dot.vy *= -1
				}

				// Update position
				dot.x += dot.vx
				dot.y += dot.vy

				// Keep within bounds
				dot.x = Math.max(0, Math.min(dimensions.width, dot.x))
				dot.y = Math.max(0, Math.min(dimensions.height, dot.y))

				// Draw dot
				ctx.fillStyle = dot.color
				ctx.beginPath()
				ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2)
				ctx.fill()
			})

			// Optionally, visualize the image area for debugging
			// ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
			// ctx.strokeRect(imageArea.x, imageArea.y, imageArea.width, imageArea.height)

			animationRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [isImageLoaded, isHovering, dimensions, dotSize, backgroundColor, imageArea])

	return (
		<motion.canvas
			ref={canvasRef}
			width={dimensions.width}
			height={dimensions.height}
			style={{
				opacity: opacity
			}}
			className={`fixed top-0 left-0 w-full h-full z-0 ${className}`}
		/>
	)
}

