import { useEffect, useState } from 'react'
import { AlertTriangle, Bot, Command, Crosshair, Factory, Search, User, X } from 'lucide-react'
import { useDigitalTwinStore } from '../../store/digitalTwinStore'

export function CommandPalette() {
  const isCommandPaletteOpen = useDigitalTwinStore((s) => s.isCommandPaletteOpen)
  const setCommandPaletteOpen = useDigitalTwinStore((s) => s.setCommandPaletteOpen)
  const machines = useDigitalTwinStore((s) => s.machines)
  const operators = useDigitalTwinStore((s) => s.operators)
  const setSelectedMachine = useDigitalTwinStore((s) => s.setSelectedMachine)
  const setSelectedOperator = useDigitalTwinStore((s) => s.setSelectedOperator)
  const setAiModalOpen = useDigitalTwinStore((s) => s.setAiModalOpen)
  const triggerEmergencyStop = useDigitalTwinStore((s) => s.triggerEmergencyStop)

  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandPaletteOpen, setCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  const filteredMachines = machines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase())
  )
  const filteredOperators = operators.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()) || o.role.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-xl bg-[#0A0F17] border border-[#00F3FF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search size={18} className="text-[#00F3FF]" />
          <input
            autoFocus
            type="text"
            placeholder="Digite para buscar máquinas, operadores ou ações (ex: CNC-04, Ana, E-STOP)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Command Search Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/50">
          {/* Quick Actions Section */}
          <div className="p-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Ações Rápidas</span>
            <button
              onClick={() => {
                setAiModalOpen(true)
                setCommandPaletteOpen(false)
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#00F3FF]/10 text-slate-200 hover:text-[#00F3FF] font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <Bot size={15} /> Abrir Motor de Recomendação IA
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">ENTER</kbd>
            </button>

            <button
              onClick={() => {
                triggerEmergencyStop()
                setCommandPaletteOpen(false)
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FF2A6D]/15 text-slate-200 hover:text-[#FF2A6D] font-mono text-xs transition-all"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle size={15} /> Acionar Parada de Emergência (E-STOP)
              </span>
              <span className="text-[10px] text-[#FF2A6D] font-bold">ALERTA</span>
            </button>
          </div>

          {/* Machines Section */}
          {filteredMachines.length > 0 && (
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Máquinas 3D ({filteredMachines.length})</span>
              {filteredMachines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMachine(m.id)
                    setCommandPaletteOpen(false)
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 text-slate-200 font-mono text-xs transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Factory size={15} className="text-[#00F3FF]" /> {m.code} - {m.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.type}</span>
                </button>
              ))}
            </div>
          )}

          {/* Operators Section */}
          {filteredOperators.length > 0 && (
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Operadores ({filteredOperators.length})</span>
              {filteredOperators.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSelectedOperator(o.id)
                    setCommandPaletteOpen(false)
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 text-slate-200 font-mono text-xs transition-all"
                >
                  <span className="flex items-center gap-2">
                    <User size={15} className="text-[#FFB800]" /> {o.name} ({o.role})
                  </span>
                  <span className="text-[10px] text-slate-400">{o.shift}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
