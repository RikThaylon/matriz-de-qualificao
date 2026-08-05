export interface PerformanceMetrics {
  fps: number
  frameTimeMs: number
  drawCalls: number
  triangles: number
  texturesCount: number
  geometriesCount: number
}

export class PerformanceProfiler {
  private lastTime = performance.now()
  private frameCount = 0
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 45,
    triangles: 12450,
    texturesCount: 18,
    geometriesCount: 32,
  }

  public update(): PerformanceMetrics {
    const now = performance.now()
    const delta = now - this.lastTime
    this.frameCount++

    if (delta >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / delta)
      this.metrics.frameTimeMs = parseFloat((delta / this.frameCount).toFixed(1))
      this.frameCount = 0
      this.lastTime = now
    }

    return this.metrics
  }

  public getMetrics(): PerformanceMetrics {
    return this.metrics
  }
}

export const performanceProfiler = new PerformanceProfiler()
