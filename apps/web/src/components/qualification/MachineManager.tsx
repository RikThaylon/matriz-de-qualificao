import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, GripVertical, Info, Plus, Trash2, X } from 'lucide-react'
import { useQualificationStore } from '../../store/qualificationStore'
import { Machine, MachineSkillRequirement, Role, Shift, ROLE_LABELS } from '../../types/qualification'
import { THEME } from '../../design/theme3M'

const ALL_ROLES: Role[] = ['OPERADOR_D', 'OPERADOR_C', 'OPERADOR_B', 'OPERADOR_A', 'FACILITADOR']
const ALL_SHIFTS: Shift[] = ['1T', '2T', '3T']

function MachineSkillConfig({ machineId }: { machineId: string }) {
  const { machines, skills, updateMachineSkills } = useQualificationStore()
  const machine = machines.find(m => m.id === machineId)!

  const toggle = (skillId: string, field: 'mandatory' | 'critical') => {
    const req = machine.requiredSkills.find(r => r.skillId === skillId)
    if (!req) return
    if (field === 'critical' && !req.mandatory) return // Critical requires mandatory
    const updated: MachineSkillRequirement[] = machine.requiredSkills.map(r =>
      r.skillId === skillId ? { ...r, [field]: !r[field] } : r
    )
    updateMachineSkills(machineId, updated)
  }

  const addSkill = (skillId: string) => {
    if (machine.requiredSkills.some(r => r.skillId === skillId)) return
    updateMachineSkills(machineId, [...machine.requiredSkills, { skillId, mandatory: true, critical: false }])
  }

  const removeSkill = (skillId: string) => {
    updateMachineSkills(machineId, machine.requiredSkills.filter(r => r.skillId !== skillId))
  }

  const availableSkills = skills.filter(s => !machine.requiredSkills.some(r => r.skillId === s.id))

  return (
    <div className="space-y-3">
      {machine.requiredSkills.length === 0 ? (
        <p className="text-xs text-white/30 italic">Nenhuma skill vinculada ainda.</p>
      ) : (
        <div className="space-y-1.5">
          {machine.requiredSkills.map(req => {
            const skill = skills.find(s => s.id === req.skillId)
            if (!skill) return null
            return (
              <div
                key={req.skillId}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/8"
              >
                <span className="flex-1 text-sm text-white font-medium truncate">{skill.name}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-white/60 hover:text-white transition-all select-none">
                  <input
                    type="checkbox"
                    checked={req.mandatory}
                    onChange={() => toggle(req.skillId, 'mandatory')}
                    className="accent-red-500 w-3 h-3"
                  />
                  Obrigatória
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-orange-400/80 hover:text-orange-300 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={!!req.critical}
                    disabled={!req.mandatory}
                    onChange={() => toggle(req.skillId, 'critical')}
                    className="accent-orange-500 w-3 h-3"
                  />
                  Crítica NR-12
                </label>
                <button onClick={() => removeSkill(req.skillId)} className="text-white/25 hover:text-red-400 transition-all">
                  <X size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
      {availableSkills.length > 0 && (
        <select
          defaultValue=""
          onChange={e => { if (e.target.value) { addSkill(e.target.value); e.target.value = '' } }}
          className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white/60 outline-none cursor-pointer"
        >
          <option value="" disabled>+ Adicionar skill à máquina…</option>
          {availableSkills.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>)}
        </select>
      )}
    </div>
  )
}

function MachineCard({ machine }: { machine: Machine }) {
  const { departments, updateMachine } = useQualificationStore()
  const [expanded, setExpanded] = useState(false)
  const dept = departments.find(d => d.id === machine.departmentId)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{ background: THEME.colors.charcoalMid }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all"
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dept?.color || THEME.colors.muted }} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">{machine.name}</div>
          <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: THEME.colors.muted }}>
            <span className="font-mono">{machine.code}</span>
            <span>·</span>
            <span>Mín: {ROLE_LABELS[machine.minRole]}</span>
            <span>·</span>
            <span>{machine.requiredSkills.length} skill{machine.requiredSkills.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <span className="text-xs text-white/30">{expanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/8 px-4 py-3 space-y-3"
          >
            {/* Role & Shifts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Cargo Mínimo</label>
                <select
                  value={machine.minRole}
                  onChange={e => updateMachine(machine.id, { minRole: e.target.value as Role })}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white outline-none cursor-pointer"
                >
                  {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Turnos</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ALL_SHIFTS.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        const curr = machine.shifts
                        const next = curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s]
                        updateMachine(machine.id, { shifts: next })
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border"
                      style={
                        machine.shifts.includes(s)
                          ? { background: THEME.colors.red, borderColor: THEME.colors.red, color: '#fff' }
                          : { background: 'transparent', borderColor: 'rgba(255,255,255,0.15)', color: THEME.colors.muted }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Skills */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Skills Requeridas</label>
              <MachineSkillConfig machineId={machine.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function MachineManager() {
  const { machines, departments, skills, addMachine, addSkill } = useQualificationStore()
  const [showAddMachine, setShowAddMachine] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [mName, setMName] = useState('')
  const [mCode, setMCode] = useState('')
  const [mDept, setMDept] = useState('')
  const [mRole, setMRole] = useState<Role>('OPERADOR_C')
  const [sName, setSName] = useState('')
  const [sDesc, setSDesc] = useState('')
  const [sDept, setSDept] = useState('')

  const createMachine = () => {
    if (!mName.trim() || !mCode.trim() || !mDept) return
    addMachine({ name: mName.trim(), code: mCode.trim().toUpperCase(), departmentId: mDept, minRole: mRole, requiredSkills: [], requiredHeadcount: 1, shifts: ['1T'] })
    setMName(''); setMCode(''); setMDept(''); setShowAddMachine(false)
  }

  const createSkill = () => {
    if (!sName.trim() || !sDept) return
    addSkill({ name: sName.trim(), description: sDesc.trim(), departmentId: sDept })
    setSName(''); setSDesc(''); setSDept(''); setShowAddSkill(false)
  }

  const activeDepts = departments.filter(d => !d.archived)

  return (
    <div className="space-y-8">
      {/* MACHINES SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Máquinas</h2>
            <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>Configure cargo mínimo, turnos e skills por máquina</p>
          </div>
          <button onClick={() => setShowAddMachine(!showAddMachine)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: THEME.colors.red }}>
            <Plus size={15} /> Nova Máquina
          </button>
        </div>

        <AnimatePresence>
          {showAddMachine && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 rounded-xl border border-white/10 p-4 space-y-3" style={{ background: THEME.colors.charcoalMid }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Nome</label>
                  <input autoFocus value={mName} onChange={e => setMName(e.target.value)} placeholder="Ex: Centro CNC 5 Eixos" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/60 placeholder-white/25 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Código</label>
                  <input value={mCode} onChange={e => setMCode(e.target.value)} placeholder="CNC-05" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-red-500/60 placeholder-white/25 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Departamento</label>
                  <select value={mDept} onChange={e => setMDept(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                    <option value="" disabled className="bg-gray-900">Selecionar...</option>
                    {activeDepts.map(d => <option key={d.id} value={d.id} className="bg-gray-900">{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Cargo Mínimo</label>
                  <select value={mRole} onChange={e => setMRole(e.target.value as Role)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                    {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddMachine(false)} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white transition-all">Cancelar</button>
                <button onClick={createMachine} disabled={!mName.trim() || !mCode.trim() || !mDept} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-all" style={{ background: THEME.colors.red }}>Criar Máquina</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {machines.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-white/10">
              <Cpu size={28} className="mx-auto mb-2 opacity-20 text-white" />
              <p className="text-sm text-white/30">Nenhuma máquina cadastrada.</p>
            </div>
          ) : (
            machines.map(m => <MachineCard key={m.id} machine={m} />)
          )}
        </div>
      </div>

      {/* SKILLS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Catálogo de Skills</h2>
            <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>Skills disponíveis para vincular a máquinas e colaboradores</p>
          </div>
          <button onClick={() => setShowAddSkill(!showAddSkill)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: THEME.colors.charcoalLight }}>
            <Plus size={15} /> Nova Skill
          </button>
        </div>

        <AnimatePresence>
          {showAddSkill && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 rounded-xl border border-white/10 p-4 space-y-3" style={{ background: THEME.colors.charcoalMid }}>
              <input autoFocus value={sName} onChange={e => setSName(e.target.value)} placeholder="Nome da skill (ex: NR-12 Segurança)" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/60 placeholder-white/25 transition-all" />
              <input value={sDesc} onChange={e => setSDesc(e.target.value)} placeholder="Descrição breve (opcional)" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/60 placeholder-white/25 transition-all" />
              <select value={sDept} onChange={e => setSDept(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer">
                <option value="" disabled className="bg-gray-900">Departamento…</option>
                {activeDepts.map(d => <option key={d.id} value={d.id} className="bg-gray-900">{d.name}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddSkill(false)} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white transition-all">Cancelar</button>
                <button onClick={createSkill} disabled={!sName.trim() || !sDept} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-all" style={{ background: THEME.colors.red }}>Criar Skill</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {skills.map(skill => {
            const dept = departments.find(d => d.id === skill.departmentId)
            return (
              <div key={skill.id} className="px-3 py-2.5 rounded-xl border border-white/8 flex items-start gap-2.5" style={{ background: THEME.colors.charcoalMid }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: dept?.color || THEME.colors.muted }} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{skill.name}</div>
                  {skill.description && <div className="text-xs mt-0.5 truncate" style={{ color: THEME.colors.muted }}>{skill.description}</div>}
                  <div className="text-xs mt-1" style={{ color: dept?.color || THEME.colors.muted }}>{dept?.name || '—'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
