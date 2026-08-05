import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity, AlertTriangle, Bot, CheckCircle2, Cpu, Crosshair, Flame,
  Gauge, ShieldAlert, UserPlus, Users, X, Zap
} from 'lucide-react'
import { useDigitalTwinStore } from '../../store/digitalTwinStore'

export function MachineDetailPanel() {
  const selectedMachineId = useDigitalTwinStore((s) => s.selectedMachineId)
  const machines = useDigitalTwinStore((s) => s.machines)
  const operators = useDigitalTwinStore((s) => s.operators)
  const setSelectedMachine = useDigitalTwinStore((s) => s.setSelectedMachine)
  const setAiModalOpen = useDigitalTwinStore((s) => s.setAiModalOpen)
  const unassignOperator = useDigitalTwinStore((s) => s.unassignOperator)
  const assignOperatorToMachine = useDigitalTwinStore((s) => s.assignOperatorToMachine)
  const setCameraMode = useDigitalTwinStore((s) => s.setCameraMode)

  const machine = machines.find((m) => m.id === selectedMachineId)
  if (!machine) return null

  const assignedOperator = operators.find((o) => o.id === machine.operatorId)

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="absolute top-20 right-4 z-20 w-96 bg-[#0A0F17]/90 backdrop-blur-xl border border-[#00F3FF]/30 rounded-2xl p-5 shadow-[0_0_35px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#00F3FF]/10 text-[#00F3FF] border border-[#00F3FF]/30 font-bold">
                {machine.code}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">{machine.type}</span>
            </div>
            <h2 className="font-mono text-base font-bold text-slate-100 mt-1">{machine.name}</h2>
          </div>
          <button
            onClick={() => setSelectedMachine(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Machine Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Gauge size={12} className="text-[#00FF9D]" /> Eficiência OEE
            </span>
            <div className="text-xl font-mono font-bold text-[#00FF9D] mt-1">{machine.oee}%</div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Flame size={12} className="text-[#FFB800]" /> Temperatura
            </span>
            <div className="text-xl font-mono font-bold text-[#FFB800] mt-1">{machine.temperature} °C</div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Activity size={12} className="text-[#00F3FF]" /> Vibração Triaxial
            </span>
            <div className="text-xl font-mono font-bold text-[#00F3FF] mt-1">{machine.vibration} mm/s</div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Zap size={12} className="text-[#A855F7]" /> Consumo Energia
            </span>
            <div className="text-xl font-mono font-bold text-[#A855F7] mt-1">{machine.powerKw} kW</div>
          </div>
        </div>

        {/* Required Competences / Skills */}
        <div className="mb-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
            Competências Requeridas NR-12
          </span>
          <div className="flex flex-wrap gap-1.5">
            {machine.requiredSkills.map((req, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
              >
                {req}
              </span>
            ))}
          </div>
        </div>

        {/* Operator Assignment Status */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-3 mb-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
            Operador Alocado no Posto
          </span>
          {assignedOperator ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center text-slate-950"
                  style={{ backgroundColor: assignedOperator.color }}
                >
                  {assignedOperator.initials}
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-slate-100">{assignedOperator.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{assignedOperator.role}</div>
                </div>
              </div>
              <button
                onClick={() => unassignOperator(assignedOperator.id)}
                className="text-[10px] font-mono px-2 py-1 rounded bg-[#FF2A6D]/20 hover:bg-[#FF2A6D]/40 text-[#FF2A6D] border border-[#FF2A6D]/40 font-semibold transition-all"
              >
                Desalocar
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xs font-mono text-[#FFB800] block mb-2">Posto vago - Sem operador alocado</span>
              <button
                onClick={() => setAiModalOpen(true, machine.id)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#00F3FF]/15 hover:bg-[#00F3FF]/25 border border-[#00F3FF]/40 text-[#00F3FF] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,243,255,0.15)]"
              >
                <Bot size={15} /> IA Sugerir Melhor Operador
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setCameraMode('focusMachine', machine.position)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold transition-all"
          >
            <Crosshair size={14} /> Focar 3D
          </button>
          <button
            onClick={() => setAiModalOpen(true, machine.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#00F3FF]/20 hover:bg-[#00F3FF]/30 border border-[#00F3FF]/50 text-[#00F3FF] font-mono text-xs font-semibold transition-all"
          >
            <Bot size={14} /> Análise IA
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
