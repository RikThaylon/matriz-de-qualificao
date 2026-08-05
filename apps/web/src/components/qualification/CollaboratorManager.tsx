import { Check, Info, Plus, ShieldAlert, User, Users, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { THEME } from '../../design/theme3M'
import { useQualificationStore } from '../../store/qualificationStore'
import { Collaborator, Role, ROLE_LABELS, Shift } from '../../types/qualification'

const ALL_ROLES: Role[] = ['OPERADOR_D', 'OPERADOR_C', 'OPERADOR_B', 'OPERADOR_A', 'FACILITADOR']
const ALL_SHIFTS: Shift[] = ['1T', '2T', '3T']
const AVATARS = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5']

const AVATAR_COLORS: Record<string, string> = {
  'avatar-1': '#CC0000',
  'avatar-2': '#0066CC',
  'avatar-3': '#006633',
  'avatar-4': '#CC6600',
  'avatar-5': '#6600CC',
}

function CollaboratorRow({ collab }: { collab: Collaborator }) {
  const { skills, updateCollaboratorRole } = useQualificationStore()

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 hover:border-white/15 transition-all" style={{ background: THEME.colors.charcoalMid }}>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center text-white shrink-0 shadow-md" style={{ background: AVATAR_COLORS[collab.avatar3DPreset] || THEME.colors.red }}>
        {collab.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-white truncate">{collab.name}</div>
        <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: THEME.colors.muted }}>
          <span>{collab.shift}</span>
          <span>·</span>
          <span>{collab.skillIds.length} skill{collab.skillIds.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <select
        value={collab.role}
        onChange={e => updateCollaboratorRole(collab.id, e.target.value as Role)}
        className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-xs font-semibold text-white outline-none cursor-pointer"
      >
        {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_LABELS[r]}</option>)}
      </select>
    </div>
  )
}

export function CollaboratorManager() {
  const { collaborators, addCollaborator } = useQualificationStore()
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('OPERADOR_C')
  const [shift, setShift] = useState<Shift>('1T')
  const [avatar, setAvatar] = useState('avatar-1')

  const create = () => {
    if (!name.trim()) return
    addCollaborator({ name: name.trim(), role, shift, avatar3DPreset: avatar, skillIds: [] })
    setName(''); setRole('OPERADOR_C'); setShift('1T'); setAvatar('avatar-1'); setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Colaboradores</h2>
          <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>Gerencie os membros da equipe e seus cargos</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: THEME.colors.red }}>
          <Plus size={15} /> Novo Colaborador
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: THEME.colors.charcoalMid }}>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="Nome completo" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/60 placeholder-white/25 transition-all" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Cargo</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white outline-none cursor-pointer">
                  {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Turno</label>
                <select value={shift} onChange={e => setShift(e.target.value as Shift)} className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white outline-none cursor-pointer">
                  {ALL_SHIFTS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1">Avatar</label>
                <select value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white outline-none cursor-pointer">
                  {AVATARS.map(a => <option key={a} value={a} className="bg-gray-900">{a}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-white/50 hover:text-white transition-all">Cancelar</button>
              <button onClick={create} disabled={!name.trim()} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-all" style={{ background: THEME.colors.red }}>Criar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {collaborators.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-white/10">
            <Users size={28} className="mx-auto mb-2 opacity-20 text-white" />
            <p className="text-sm text-white/30">Nenhum colaborador cadastrado.</p>
          </div>
        ) : (
          collaborators.map(c => <CollaboratorRow key={c.id} collab={c} />)
        )}
      </div>
    </div>
  )
}
