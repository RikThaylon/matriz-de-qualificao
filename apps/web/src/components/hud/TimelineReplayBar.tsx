import { useState } from 'react'
import { FastForward, History, Pause, Play, RotateCcw } from 'lucide-react'
import { replayEngine } from '../../engine/ReplayEngine'

export function TimelineReplayBar() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(1.0)

  const handleTogglePlay = () => {
    if (isPlaying) {
      replayEngine.stopReplay()
      setIsPlaying(false)
    } else {
      replayEngine.startReplay()
      setIsPlaying(true)
    }
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setProgress(val)
    replayEngine.seek(val)
  }

  return (
    <div className="flex items-center gap-3 bg-[#0A0F17]/85 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-2 pointer-events-auto shadow-lg">
      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-semibold uppercase">
        <History size={14} className="text-[#00F3FF]" /> Timeline Replay
      </div>

      {/* Scrub Slider */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={progress}
        onChange={handleScrub}
        className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F3FF]"
      />

      {/* Playback Controls */}
      <button
        onClick={handleTogglePlay}
        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <span className="text-[10px] font-mono text-[#00FF9D] font-bold">
        {progress === 1 ? 'AO VIVO' : `${Math.round(progress * 100)}%`}
      </span>
    </div>
  )
}
