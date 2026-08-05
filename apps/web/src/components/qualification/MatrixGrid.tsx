import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Filter, ShieldAlert } from 'lucide-react'
import { useQualificationStore } from '../../store/qualificationStore'
import { THEME } from '../../design/theme3M'

export function MatrixGrid() {
  const { collaborators, skills, departments, toggleCollaboratorSkill } = useQualificationStore()
  const [filterDept, setFilterDept] = useState<string>('all')

  const activeDepts = departments.filter(d => !d.archived)

  const filteredSkills = useMemo(() =>
    filterDept === 'all'
      ? skills
      : skills.filter(s => s.departmentId === filterDept),
    [skills, filterDept]
  )

  if (collaborators.length === 0 || skills.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
        <p className="text-sm text-white/30">Cadastre colaboradores e skills para exibir a matriz.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Matriz de Skills</h2>
          <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>
            Clique na célula para adicionar ou remover uma skill do colaborador
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-gray-900">Todos os departamentos</option>
            {activeDepts.map(d => <option key={d.id} value={d.id} className="bg-gray-900">{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs" style={{ color: THEME.colors.muted }}>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: THEME.colors.aprovado }}>
            <Check size={10} strokeWidth={3} className="text-white" />
          </span>
          Possui skill
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded border border-white/15" style={{ background: THEME.colors.charcoalLight }} />
          Não possui
        </span>
      </div>

      {/* Scrollable Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10" style={{ background: THEME.colors.charcoalMid }}>
        <table className="w-full min-w-max table-fixed">
          <thead>
            <tr>
              {/* Fixed skill name column */}
              <th className="sticky left-0 z-10 text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-r border-white/8"
                style={{ background: THEME.colors.charcoal, color: THEME.colors.muted, minWidth: 200 }}>
                Skill ↓ / Colaborador →
              </th>
              {collaborators.map(collab => (
                <th
                  key={collab.id}
                  className="px-2 py-3 text-center border-b border-white/8"
                  style={{ minWidth: 80 }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center text-white shadow-sm"
                      style={{ background: THEME.colors.charcoalLight }}
                    >
                      {collab.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-semibold text-white/70 leading-tight text-center max-w-[72px] truncate" title={collab.name}>
                      {collab.name.split(' ')[0]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map((skill, skillIdx) => {
              const dept = departments.find(d => d.id === skill.departmentId)
              return (
                <tr
                  key={skill.id}
                  className="group hover:bg-white/3 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* Skill name cell */}
                  <td
                    className="sticky left-0 z-10 px-4 py-2.5 border-r border-white/8"
                    style={{ background: THEME.colors.charcoal }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dept?.color || THEME.colors.muted }} />
                      <span className="text-sm font-medium text-white truncate">{skill.name}</span>
                    </div>
                    <span className="text-[10px] ml-3.5" style={{ color: THEME.colors.muted }}>{dept?.name}</span>
                  </td>

                  {/* Collaborator cells */}
                  {collaborators.map(collab => {
                    const has = collab.skillIds.includes(skill.id)
                    return (
                      <td key={collab.id} className="px-2 py-2 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleCollaboratorSkill(collab.id, skill.id)}
                          title={has ? `Remover "${skill.name}" de ${collab.name}` : `Adicionar "${skill.name}" a ${collab.name}`}
                          aria-label={has ? `${collab.name} possui ${skill.name} - clique para remover` : `${collab.name} não possui ${skill.name} - clique para adicionar`}
                          aria-pressed={has}
                          className="mx-auto w-7 h-7 rounded flex items-center justify-center transition-all border"
                          style={
                            has
                              ? { background: THEME.colors.aprovado, borderColor: THEME.colors.aprovado }
                              : { background: THEME.colors.charcoalLight, borderColor: 'rgba(255,255,255,0.12)' }
                          }
                        >
                          {has && <Check size={12} strokeWidth={3} className="text-white" />}
                        </motion.button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Coverage Summary per Collaborator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
        {collaborators.map(collab => {
          const total = filteredSkills.length
          const owned = filteredSkills.filter(s => collab.skillIds.includes(s.id)).length
          const pct = total === 0 ? 100 : Math.round((owned / total) * 100)
          return (
            <div key={collab.id} className="rounded-xl border border-white/8 p-3" style={{ background: THEME.colors.charcoalMid }}>
              <div className="text-xs font-semibold text-white truncate">{collab.name.split(' ')[0]}</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: pct === 100 ? THEME.colors.aprovado : pct >= 70 ? THEME.colors.atencao : THEME.colors.reprovado }}
                />
              </div>
              <div className="text-xs mt-1" style={{ color: THEME.colors.muted }}>{owned}/{total} skills ({pct}%)</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
