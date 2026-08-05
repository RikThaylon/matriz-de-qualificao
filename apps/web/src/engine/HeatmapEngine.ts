import * as THREE from 'three'

export type HeatmapMode = 'off' | 'thermal' | 'traffic' | 'stress'

export class HeatmapEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private texture: THREE.CanvasTexture

  constructor(width = 512, height = 512) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(this.canvas)
  }

  public generateHeatmapTexture(mode: HeatmapMode, dataPoints: { x: number; z: number; intensity: number }[]): THREE.CanvasTexture {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (mode === 'off') {
      this.texture.needsUpdate = true
      return this.texture
    }

    // Draw background darkness
    this.ctx.fillStyle = 'rgba(5, 7, 10, 0.2)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Render radial heat spots
    for (const point of dataPoints) {
      // Map world coords (-30 to +30) to canvas pixel space
      const px = ((point.x + 30) / 60) * this.canvas.width
      const py = ((point.z + 25) / 50) * this.canvas.height
      const radius = 60 * point.intensity

      const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, radius)

      if (mode === 'thermal') {
        gradient.addColorStop(0, `rgba(255, 42, 109, ${point.intensity})`)
        gradient.addColorStop(0.5, `rgba(255, 184, 0, ${point.intensity * 0.7})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      } else if (mode === 'traffic') {
        gradient.addColorStop(0, `rgba(0, 243, 255, ${point.intensity})`)
        gradient.addColorStop(0.5, `rgba(0, 255, 157, ${point.intensity * 0.7})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      } else if (mode === 'stress') {
        gradient.addColorStop(0, `rgba(168, 85, 247, ${point.intensity})`)
        gradient.addColorStop(0.5, `rgba(255, 42, 109, ${point.intensity * 0.6})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      }

      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(px, py, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.texture.needsUpdate = true
    return this.texture
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture
  }
}

export const heatmapEngine = new HeatmapEngine()
