import { useMemo } from 'react'
import { AlertTriangle, Award, BarChart3, Clock, ShieldAlert, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQualificationStore } from '../../store/qualificationStore'
import { calculateQualification } from '../../store/qualificationEngine'
import { THEME } from '../../design/theme3M'
import { Shift } from '../../types/qualification'

const ALL_SHIFTS: Shift[] = ['1T', '2T', '3T']

export function ManagementInsights() {
  const { machines, collaborators, skills, departments, allocations } = useQualificationStore()

  const insights = useMemo(() => {
    // 1. Shift coverage: for each machine × shift, how many APTO/ATENCAO collaborators exist
    const shiftCoverage: Record<string, Record<Shift, number>> = {}
    machines.forEach(m => {
      shiftCoverage[m.id] = { '1T': 0, '2T': 0, '3T': 0 }
      ALL_SHIFTS.forEach(shift => {
        if (!m.shifts.includes(shift)) return
        const aptos = collaborators.filter(c => {
          if (c.shift !== shift) return false
          const r = calculateQualification(c, m, skills)
          return r.status === 'APROVADO' || r.status === 'ATENCAO'
        })
        shiftCoverage[m.id][shift] = aptos.length
      })
    })

    // 2. Line stop risk: machines with only 1 or 0 apto collaborators across all shifts
    const lineStopRisk = machines.filter(m => {
      const totalApto = collaborators.filter(c => {
        const r = calculateQualification(c, m, skills)
        return r.status === 'APROVADO' || r.status === 'ATENCAO'
      }).length
      return totalApto <= 1
    })

    // 3. Skill gaps: which skills are most absent across all collaborators
    const skillGaps = skills.map(skill => ({
      skill,
      ownedCount: collaborators.filter(c => c.skillIds.includes(skill.id)).length,
      gapCount: collaborators.length - collaborators.filter(c => c.skillIds.includes(skill.id)).length,
    })).sort((a, b) => b.gapCount - a.gapCount).slice(0, 5)

    // 4. Versatility ranking: collaborators who are APTO for the most machines
    const versatility = collaborators.map(c => ({
      collab: c,
      aptoCount: machines.filter(m => {
        const r = calculateQualification(c, m, skills)
        return r.status === 'APROVADO' || r.status === 'ATENCAO'
      }).length,
    })).sort((a, b) => b.aptoCount - a.aptoCount)

    return { shiftCoverage, lineStopRisk, skillGaps, versatility }
  }, [machines, collaborators, skills])

  if (machines.length === 0 || collaborators.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
        <BarChart3 size={32} className="mx-auto mb-3 opacity-20 text-white" />
        <p className="text-sm text-white/30">Cadastre máquinas e colaboradores para ver os insights de gestão.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Insights de Gestão</h2>
        <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>
          Cada métrica responde a uma pergunta real de gestão operacional
        </p>
      </div>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* 1. Line Stop Risk */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 overflow-hidden"
          style={{ background: THEME.colors.charcoalMid }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,58,58,0.15)' }}>
              <AlertTriangle size={16} style={{ color: THEME.colors.reprovado }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Risco de Parada de Linha</div>
              <div className="text-xs" style={{ color: THEME.colors.muted }}>Máquinas críticas com 1 ou menos colaborador apto</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {insights.lineStopRisk.length === 0 ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: THEME.colors.aprovado }}>
                <span>✓</span> Todas as máquinas possuem cobertura adequada.
              </div>
            ) : (
              insights.lineStopRisk.map(m => {
                const dept = departments.find(d => d.id === m.departmentId)
                const totalApto = collaborators.filter(c => {
                  const r = calculateQualification(c, m, skills)
                  return r.status === 'APROVADO' || r.status === 'ATENCAO'
                }).length
                return (
                  <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: totalApto === 0 ? THEME.colors.reprovadoBg : THEME.colors.atencaoBg }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dept?.color || THEME.colors.muted }} />
                      <span className="text-sm text-white font-medium">{m.name}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: totalApto === 0 ? THEME.colors.reprovado : THEME.colors.atencao, background: totalApto === 0 ? 'rgba(255,58,58,0.15)' : 'rgba(255,184,0,0.15)' }}>
                      {totalApto === 0 ? 'SEM COBERTURA' : `${totalApto} apto`}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* 2. Shift Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/10 overflow-hidden"
          style={{ background: THEME.colors.charcoalMid }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,192,96,0.12)' }}>
              <Clock size={16} style={{ color: THEME.colors.aprovado }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Cobertura por Turno</div>
              <div className="text-xs" style={{ color: THEME.colors.muted }}>Colaboradores aptos por máquina e turno</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-2 font-semibold" style={{ color: THEME.colors.muted }}>Máquina</th>
                  {ALL_SHIFTS.map(s => <th key={s} className="px-3 py-2 font-bold text-center" style={{ color: THEME.colors.muted }}>{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {machines.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-white">{m.name}</td>
                    {ALL_SHIFTS.map(shift => {
                      const count = m.shifts.includes(shift) ? insights.shiftCoverage[m.id]?.[shift] ?? 0 : null
                      return (
                        <td key={shift} className="px-3 py-2.5 text-center">
                          {count === null ? (
                            <span style={{ color: THEME.colors.muted }}>—</span>
                          ) : (
                            <span className="font-bold" style={{ color: count === 0 ? THEME.colors.reprovado : count === 1 ? THEME.colors.atencao : THEME.colors.aprovado }}>
                              {count}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 3. Skill Gaps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 overflow-hidden"
          style={{ background: THEME.colors.charcoalMid }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.12)' }}>
              <ShieldAlert size={16} style={{ color: THEME.colors.atencao }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Gap de Treinamento</div>
              <div className="text-xs" style={{ color: THEME.colors.muted }}>Skills que mais faltam na equipe</div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {insights.skillGaps.filter(g => g.gapCount > 0).length === 0 ? (
              <p className="text-sm" style={{ color: THEME.colors.aprovado }}>✓ Nenhum gap crítico identificado.</p>
            ) : (
              insights.skillGaps.filter(g => g.gapCount > 0).map(({ skill, ownedCount, gapCount }) => {
                const pct = Math.round((ownedCount / collaborators.length) * 100)
                return (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{skill.name}</span>
                      <span className="text-xs font-semibold" style={{ color: pct >= 70 ? THEME.colors.aprovado : pct >= 40 ? THEME.colors.atencao : THEME.colors.reprovado }}>
                        {ownedCount}/{collaborators.length} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: pct >= 70 ? THEME.colors.aprovado : pct >= 40 ? THEME.colors.atencao : THEME.colors.reprovado }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* 4. Versatility Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-white/10 overflow-hidden"
          style={{ background: THEME.colors.charcoalMid }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: THEME.colors.redGlow }}>
              <Award size={16} style={{ color: THEME.colors.red }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Ranking de Versatilidade</div>
              <div className="text-xs" style={{ color: THEME.colors.muted }}>Colaboradores aptos para mais máquinas</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {insights.versatility.map(({ collab, aptoCount }, idx) => (
              <div key={collab.id} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: idx === 0 ? THEME.colors.redGlow : 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-bold w-5 text-center" style={{ color: idx === 0 ? THEME.colors.red : THEME.colors.muted }}>#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{collab.name}</div>
                  <div className="text-xs" style={{ color: THEME.colors.muted }}>{collab.role.replace('OPERADOR_', 'Op. ')} · {collab.shift}</div>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: aptoCount > 0 ? 'rgba(0,192,96,0.15)' : 'rgba(68,68,68,0.2)',
                    color: aptoCount > 0 ? THEME.colors.aprovado : THEME.colors.muted
                  }}
                >
                  {aptoCount}/{machines.length} máq.
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
