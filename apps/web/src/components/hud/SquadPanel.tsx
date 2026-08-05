import { AnimatePresence, motion } from 'framer-motion'
import { Award, ChevronRight, ShieldAlert, Sparkles, UserCheck, Users } from 'lucide-react'
import { OperatorData, useDigitalTwinStore } from '../../store/digitalTwinStore'

export function SquadPanel() {
  const operators = useDigitalTwinStore((s) => s.operators)
  const selectedOperatorId = useDigitalTwinStore((s) => s.selectedOperatorId)
  const setSelectedOperator = useDigitalTwinStore((s) => s.setSelectedOperator)
  const setDraggedOperator = useDigitalTwinStore((s) => s.setDraggedOperator)
  const setAiModalOpen = useDigitalTwinStore((s) => s.setAiModalOpen)
  const unassignOperator = useDigitalTwinStore((s) => s.unassignOperator)

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto flex items-end justify-between gap-4">
      {/* Squad Operator Deck Container */}
      <div className="flex-1 bg-[#0A0F17]/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 font-semibold uppercase tracking-wider">
            <Users size={15} className="text-[#00F3FF]" /> Squad de Operadores & Qualificação 3D
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Arraste o operador até a máquina ou selecione para alocação via IA
          </span>
        </div>

        {/* Operators List Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {operators.map((op) => {
            const isSelected = selectedOperatorId === op.id
            const isAssigned = !!op.assignedMachineId
            const hasExpiredCert = op.skills.some((s) => s.expired)

            return (
              <motion.div
                key={op.id}
                draggable
                onDragStart={() => setDraggedOperator(op.id)}
                onDragEnd={() => setDraggedOperator(null)}
                onClick={() => setSelectedOperator(op.id)}
                whileHover={{ y: -3 }}
                className={`relative cursor-grab active:cursor-grabbing rounded-xl p-3 border transition-all ${
                  isSelected
                    ? 'bg-[#101826] border-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                    : 'bg-[#0F172A]/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Avatar Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center text-slate-950 shadow-md"
                      style={{ backgroundColor: op.color }}
                    >
                      {op.initials}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-100">{op.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{op.role}</div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-slate-400">{op.shift}</span>
                  {isAssigned ? (
                    <span className="text-[#00FF9D] flex items-center gap-1 font-semibold">
                      <UserCheck size={10} /> Em Operação
                    </span>
                  ) : (
                    <span className="text-[#FFB800] flex items-center gap-1">
                      <Users size={10} /> Squad Base
                    </span>
                  )}
                </div>

                {/* Primary Skill Badges */}
                <div className="flex flex-wrap gap-1">
                  {op.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        s.expired
                          ? 'bg-[#FF2A6D]/20 text-[#FF2A6D] border-[#FF2A6D]/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {s.name} ({s.level}%)
                    </span>
                  ))}
                </div>

                {/* Expiration Warning Alert */}
                {hasExpiredCert && (
                  <div className="mt-2 text-[9px] font-mono text-[#FF2A6D] flex items-center gap-1">
                    <ShieldAlert size={10} /> NR-12 Vencimento Próximo
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
