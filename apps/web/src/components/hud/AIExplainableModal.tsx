import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertOctagon, Bot, CheckCircle2, ChevronRight, ShieldAlert,
  ShieldCheck, Sparkles, UserCheck, X, Zap
} from 'lucide-react'
import { useDigitalTwinStore } from '../../store/digitalTwinStore'

export function AIExplainableModal() {
  const isAiModalOpen = useDigitalTwinStore((s) => s.isAiModalOpen)
  const aiTargetMachineId = useDigitalTwinStore((s) => s.aiTargetMachineId)
  const aiRecommendations = useDigitalTwinStore((s) => s.aiRecommendations)
  const machines = useDigitalTwinStore((s) => s.machines)
  const operators = useDigitalTwinStore((s) => s.operators)
  const setAiModalOpen = useDigitalTwinStore((s) => s.setAiModalOpen)
  const assignOperatorToMachine = useDigitalTwinStore((s) => s.assignOperatorToMachine)

  if (!isAiModalOpen) return null

  const targetMachine = machines.find((m) => m.id === aiTargetMachineId)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0A0F17] border border-[#00F3FF]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden"
        >
          {/* Top Neon Ambient Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00F3FF] via-[#00FF9D] to-[#A855F7]" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F3FF]/10 border border-[#00F3FF]/40 flex items-center justify-center text-[#00F3FF] shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-lg font-bold text-slate-100 uppercase tracking-wider">
                    Motor de Recomendação Explicável IA
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F3FF]/10 text-[#00F3FF] border border-[#00F3FF]/30">
                    EXPLAINABLE AI ENGINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Análise preditiva de adequação operacional para posto:{' '}
                  <strong className="text-[#00F3FF]">{targetMachine?.name || 'Geral'}</strong> ({targetMachine?.code})
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiModalOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Machine Requirements Summary */}
          <div className="my-4 p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-slate-400">Requisitos Críticos:</span>
              {targetMachine?.requiredSkills.map((req, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[#00F3FF] border border-[#00F3FF]/30">
                  {req}
                </span>
              ))}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Critérios: Competência Técnica (40%) • NR-12 (30%) • Histórico OEE (30%)
            </span>
          </div>

          {/* AI Candidate Ranking Cards List */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {aiRecommendations.map((rec, index) => {
              const operator = operators.find((o) => o.id === rec.operatorId)
              if (!operator) return null

              const isTopPick = index === 0

              return (
                <div
                  key={rec.operatorId}
                  className={`p-4 rounded-xl border transition-all ${
                    isTopPick
                      ? 'bg-[#101826] border-[#00FF9D]/60 shadow-[0_0_20px_rgba(0,255,157,0.15)]'
                      : 'bg-[#0F172A]/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center text-slate-950 shadow-md shrink-0"
                        style={{ backgroundColor: operator.color }}
                      >
                        {operator.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-sm font-bold text-slate-100">{operator.name}</h3>
                          <span className="text-xs text-slate-400 font-mono">({operator.role})</span>
                          {isTopPick && (
                            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/30 font-bold">
                              <Sparkles size={11} /> MELHOR OPÇÃO IA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                          <span>Experiência: {operator.experienceYears} anos</span>
                          <span>•</span>
                          <span>Segurança: {operator.safetyScore}%</span>
                          <span>•</span>
                          <span>Shift: {operator.shift}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Score & Action */}
                    <div className="flex items-center gap-4">
                      {/* Score Gauge */}
                      <div className="text-right">
                        <div
                          className={`font-mono text-xl font-bold ${
                            rec.status === 'APTA'
                              ? 'text-[#00FF9D]'
                              : rec.status === 'ATENCAO'
                              ? 'text-[#FFB800]'
                              : 'text-[#FF2A6D]'
                          }`}
                        >
                          {rec.score}% Match
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          OEE Estimado: {rec.expectedOEE}%
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          assignOperatorToMachine(operator.id, rec.machineId)
                          setAiModalOpen(false)
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
                          rec.status === 'APTA'
                            ? 'bg-[#00FF9D] hover:bg-[#00E58D] text-slate-950 shadow-[0_0_15px_rgba(0,255,157,0.3)]'
                            : rec.status === 'ATENCAO'
                            ? 'bg-[#FFB800] hover:bg-[#E5A600] text-slate-950 shadow-[0_0_15px_rgba(255,184,0,0.3)]'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <UserCheck size={14} /> Alocar Agora
                      </button>
                    </div>
                  </div>

                  {/* Explainable Rationale Reasons Bullet Points */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rec.reasons.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <CheckCircle2 size={13} className="text-[#00F3FF] shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
