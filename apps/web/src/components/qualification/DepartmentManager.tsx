import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Edit2, Plus, Shield, X } from 'lucide-react'
import { useState } from 'react'
import { Department } from '../../types/qualification'
import { useQualificationStore } from '../../store/qualificationStore'
import { THEME } from '../../design/theme3M'

function DeptCard({ dept, machineCount }: { dept: Department; machineCount: number }) {
  const { updateDepartment, archiveDepartment } = useQualificationStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dept.name)

  const saveEdit = () => {
    if (name.trim()) updateDepartment(dept.id, { name: name.trim() })
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative rounded-xl border overflow-hidden"
      style={{ borderColor: dept.color + '55', background: THEME.colors.charcoalMid }}
    >
      {/* Color accent left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: dept.color }} />

      <div className="pl-5 pr-4 py-4">
        {editing ? (
          <div className="flex gap-2 items-center">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
              className="flex-1 bg-transparent text-white font-semibold text-sm border-b border-white/30 outline-none pb-0.5"
            />
            <button onClick={saveEdit} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-all">Salvar</button>
            <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white transition-all"><X size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-white tracking-wide">{dept.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: THEME.colors.muted }}>
                {machineCount} máquina{machineCount !== 1 ? 's' : ''} vinculada{machineCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                title="Editar departamento"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => archiveDepartment(dept.id)}
                title="Arquivar departamento"
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
              >
                <Archive size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function DepartmentManager() {
  const { departments, machines, addDepartment } = useQualificationStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#CC0000')

  const active = departments.filter(d => !d.archived)
  const archived = departments.filter(d => d.archived)

  const handleAdd = () => {
    if (!newName.trim()) return
    addDepartment({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor('#CC0000')
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Departamentos</h2>
          <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>
            Gerencie as áreas de produção e suas máquinas
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all shadow-lg"
          style={{ background: THEME.colors.red }}
        >
          <Plus size={16} /> Novo Departamento
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-white/10 overflow-hidden"
            style={{ background: THEME.colors.charcoalMid }}
          >
            <div className="p-4 flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">Nome do Departamento</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                  placeholder="Ex: Usinagem CNC, Solda, Montagem..."
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/60 transition-all placeholder-white/25"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">Cor</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-white/15 cursor-pointer bg-transparent"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: THEME.colors.red }}
              >
                Criar
              </button>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Departments Grid */}
      {active.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
          <Shield size={32} className="mx-auto mb-3 opacity-20 text-white" />
          <p className="text-sm text-white/30">Nenhum departamento cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence>
            {active.map(dept => (
              <DeptCard
                key={dept.id}
                dept={dept}
                machineCount={machines.filter(m => m.departmentId === dept.id).length}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-white/30 hover:text-white/50 transition-all select-none flex items-center gap-1.5">
            <Archive size={12} /> {archived.length} departamento{archived.length > 1 ? 's' : ''} arquivado{archived.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 opacity-40">
            {archived.map(dept => (
              <div key={dept.id} className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-white/40 flex items-center justify-between">
                <span>{dept.name}</span>
                <button onClick={() => useQualificationStore.getState().updateDepartment(dept.id, { archived: false })} className="hover:text-white transition-all">Restaurar</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
