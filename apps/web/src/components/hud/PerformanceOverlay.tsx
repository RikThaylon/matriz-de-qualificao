import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'
import { performanceProfiler, PerformanceMetrics } from '../../engine/PerformanceProfiler'

export function PerformanceOverlay() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 42,
    triangles: 12400,
    texturesCount: 18,
    geometriesCount: 30,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceProfiler.update())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="hidden xl:flex items-center gap-4 bg-[#0A0F17]/85 backdrop-blur-xl border border-slate-800 rounded-xl px-3 py-1.5 pointer-events-auto text-[11px] font-mono">
      <div className="flex items-center gap-1 text-slate-400">
        <Cpu size={13} className="text-[#00FF9D]" /> PROFILER:
      </div>
      <span className="text-[#00FF9D] font-bold">{metrics.fps} FPS</span>
      <span className="text-slate-400">{metrics.frameTimeMs}ms</span>
      <span className="text-slate-400">Draws: {metrics.drawCalls}</span>
      <span className="text-slate-400">Tris: {(metrics.triangles / 1000).toFixed(1)}k</span>
    </div>
  )
}
