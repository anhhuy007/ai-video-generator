// 'use client'

// import { useEffect, useRef } from 'react'

// export default function VideoBackground() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   useEffect(() => {
//     const canvas = canvasRef.current as HTMLCanvasElement | null
//     if (!canvas) return
//     const ctx = canvas.getContext('2d')
//     if (!ctx) return

//     // Set canvas dimensions
//     const setCanvasDimensions = () => {
//       canvas.width = window.innerWidth
//       canvas.height = window.innerHeight
//     }

//     setCanvasDimensions()
//     window.addEventListener('resize', setCanvasDimensions)

//     // Particle system
//     const particles: Particle[] = []
//     const particleCount = 50

//     class Particle {
//       x: number
//       y: number
//       size: number
//       speedX: number
//       speedY: number
//       color: string

//       constructor() {
//         this.x = Math.random() * canvas.width
//         this.y = Math.random() * canvas.height
//         this.size = Math.random() * 3 + 1
//         this.speedX = Math.random() * 1 - 0.5
//         this.speedY = Math.random() * 1 - 0.5

//         // Create a gradient-like color for light theme
//         const hue = 220 + Math.random() * 60 // Blue to purple range
//         const saturation = 70 + Math.random() * 30
//         const lightness = 70 + Math.random() * 20
//         this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`
//       }

//       update() {
//         this.x += this.speedX
//         this.y += this.speedY

//         if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
//         if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
//       }

//       draw() {
//         if (!ctx) return
//         ctx.fillStyle = this.color
//         ctx.beginPath()
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
//         ctx.fill()
//       }
//     }

//     // Initialize particles
//     for (let i = 0; i < particleCount; i++) {
//       particles.push(new Particle())
//     }

//     // Connect particles with lines
//     function connectParticles() {
//       if (!ctx) return
//       const maxDistance = 150

//       for (let i = 0; i < particles.length; i++) {
//         for (let j = i; j < particles.length; j++) {
//           const dx = particles[i].x - particles[j].x
//           const dy = particles[i].y - particles[j].y
//           const distance = Math.sqrt(dx * dx + dy * dy)

//           if (distance < maxDistance) {
//             const opacity = 1 - distance / maxDistance
//             ctx.strokeStyle = `rgba(100, 120, 255, ${opacity * 0.15})`
//             ctx.lineWidth = 1
//             ctx.beginPath()
//             ctx.moveTo(particles[i].x, particles[i].y)
//             ctx.lineTo(particles[j].x, particles[j].y)
//             ctx.stroke()
//           }
//         }
//       }
//     }

//     // Animation loop
//     function animate() {
//       if (!ctx || !canvas) return

//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       // Update and draw particles
//       for (const particle of particles) {
//         particle.update()
//         particle.draw()
//       }

//       connectParticles()
//       requestAnimationFrame(animate)
//     }

//     animate()

//     return () => {
//       window.removeEventListener('resize', setCanvasDimensions)
//     }
//   }, [])

//   return (
//     <canvas
//       ref={canvasRef}
//       className='absolute inset-0 h-full w-full bg-gradient-to-br from-white to-slate-100'
//     />
//   )
// }
