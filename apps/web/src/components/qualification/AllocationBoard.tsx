import { useDraggable, useDroppable, DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Minus, ShieldAlert, Smile, Frown, Meh, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { THEME } from '../../design/theme3M'
import { calculateQualification } from '../../store/qualificationEngine'
import { useQualificationStore } from '../../store/qualificationStore'
import { Collaborator, Machine, QualificationResult, QualificationStatus, ROLE_LABELS } from '../../types/qualification'

/* ─── Avatar Reaction Fallback (2D) ─────────────────────────── */
function AvatarReaction2D({ result }: { result: QualificationResult | null }) {
  if (!result) return null
  const s = THEME.status[result.status]

  const Icon = result.status === 'APROVADO'
    ? Smile
    : result.status === 'ATENCAO'
      ? Meh
      : result.status === 'BLOQUEADO'
        ? Lock
        : Frown

  return (
    <motion.div
      key={result.status}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-1 py-3"
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: s.bg, border: `2px solid ${s.border}` }}
      >
        <Icon size={26} style={{ color: s.color }} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-bold mt-1" style={{ color: s.color }}>
        {s.label}
      </span>
    </motion.div>
  )
}

/* ─── Draggable Collaborator Card ────────────────────────────── */
function DraggableCollabCard({ collab }: { collab: Collaborator }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: collab.id })

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      whileHover={{ x: 4 }}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        background: THEME.colors.charcoalMid,
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all select-none"
    >
      <div
        className="w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center text-white shrink-0"
        style={{ background: THEME.colors.red }}
      >
        {collab.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{collab.name}</div>
        <div className="text-xs" style={{ color: THEME.colors.muted }}>{ROLE_LABELS[collab.role]} · {collab.shift}</div>
      </div>
    </motion.div>
  )
}

/* ─── Machine Drop Slot ──────────────────────────────────────── */
function MachineDropSlot({
  machine,
  activeCollabId,
  result,
  onUnallocate,
}: {
  machine: Machine
  activeCollabId?: string
  result: QualificationResult | null
  onUnallocate: () => void
}) {
  const { departments, collaborators } = useQualificationStore()
  const dept = departments.find(d => d.id === machine.departmentId)
  const allocatedCollab = collaborators.find(c => c.id === activeCollabId)
  const s = result ? THEME.status[result.status] : null

  const { isOver, setNodeRef } = useDroppable({ id: machine.id })

  const borderColor = isOver
    ? (s ? s.border : 'rgba(255,255,255,0.4)')
    : result
      ? s!.border
      : 'rgba(255,255,255,0.1)'

  const bgColor = isOver
    ? (s ? s.bg : 'rgba(255,255,255,0.05)')
    : 'transparent'

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className="rounded-xl border-2 overflow-hidden transition-colors duration-150"
      style={{ borderColor, background: THEME.colors.charcoalMid }}
    >
      {/* Machine Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: dept?.color || THEME.colors.muted }} />
        <span className="text-sm font-semibold text-white truncate flex-1">{machine.name}</span>
        <span className="text-xs font-mono" style={{ color: THEME.colors.muted }}>{machine.code}</span>
      </div>

      {/* Drop zone body */}
      <div className="px-4 py-3 min-h-[110px] flex flex-col items-center justify-center gap-2">
        {allocatedCollab ? (
          <div className="w-full space-y-2">
            {/* Avatar Reaction */}
            <AnimatePresence mode="wait">
              <AvatarReaction2D result={result} />
            </AnimatePresence>

            {/* Allocated Collaborator info */}
            <div
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
              style={{ background: s?.bg, borderColor: s?.border }}
            >
              <div
                className="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center text-white shrink-0"
                style={{ background: THEME.colors.red }}
              >
                {allocatedCollab.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{allocatedCollab.name}</div>
                {result && (
                  <div className="text-xs font-semibold" style={{ color: s?.color }}>
                    {result.statusLabel}
                  </div>
                )}
              </div>
              <button
                onClick={onUnallocate}
                title="Remover da máquina"
                className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white transition-all"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Missing skills warning */}
            {result && (result.missingCriticalSkills.length > 0 || result.missingMandatorySkills.length > 0) && (
              <div className="text-xs rounded-xl p-2.5 border" style={{ background: THEME.colors.reprovadoBg, borderColor: 'rgba(255,58,58,0.3)', color: THEME.colors.reprovado }}>
                {result.missingCriticalSkills.length > 0 && (
                  <div className="flex items-center gap-1 font-semibold">
                    <ShieldAlert size={11} /> Críticas ausentes: {result.missingCriticalSkills.join(', ')}
                  </div>
                )}
                {result.missingMandatorySkills.filter(s => !result.missingCriticalSkills.includes(s)).length > 0 && (
                  <div className="mt-0.5">Faltam: {result.missingMandatorySkills.filter(s => !result.missingCriticalSkills.includes(s)).join(', ')}</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center">
              <Minus size={18} className="text-white" />
            </div>
            <span className="text-xs text-white">Arraste um colaborador</span>
          </div>
        )}
      </div>

      {/* Machine Requirements footer */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: THEME.colors.charcoalLight, color: THEME.colors.muted }}>
          Mín: {ROLE_LABELS[machine.minRole]}
        </span>
        {machine.shifts.map(s => (
          <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: THEME.colors.redGlow, color: THEME.colors.red, border: '1px solid rgba(204,0,0,0.3)' }}>{s}</span>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Main Allocation Board ──────────────────────────────────── */
export function AllocationBoard() {
  const { machines, collaborators, skills, allocations, allocateCollaborator, unallocateMachine } = useQualificationStore()
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [filterShift, setFilterShift] = useState<string>('all')

  const filteredCollabs = filterShift === 'all'
    ? collaborators
    : collaborators.filter(c => c.shift === filterShift)

  const availableCollabs = filteredCollabs.filter(c => !Object.values(allocations).includes(c.id))

  // Pre-calculate all qualification results for allocated collaborators
  const qualResults = useMemo(() => {
    const results: Record<string, QualificationResult> = {}
    machines.forEach(machine => {
      const collabId = allocations[machine.id]
      if (!collabId) return
      const collab = collaborators.find(c => c.id === collabId)
      if (!collab) return
      results[machine.id] = calculateQualification(collab, machine, skills)
    })
    return results
  }, [machines, collaborators, skills, allocations])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDragId(null)
    if (!over) return
    const collabId = String(active.id)
    const machineId = String(over.id)
    if (machines.find(m => m.id === machineId)) {
      allocateCollaborator(machineId, collabId)
    }
  }

  const draggedCollab = collaborators.find(c => c.id === activeDragId)

  return (
    <DndContext
      onDragStart={e => setActiveDragId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Alocação & Qualificação</h2>
            <p className="text-sm mt-0.5" style={{ color: THEME.colors.muted }}>
              Arraste colaboradores até a máquina — a qualificação é calculada automaticamente
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: THEME.colors.muted }}>
            {['all', '1T', '2T', '3T'].map(s => (
              <button
                key={s}
                onClick={() => setFilterShift(s)}
                className="px-3 py-1.5 rounded-lg font-semibold transition-all"
                style={filterShift === s
                  ? { background: THEME.colors.red, color: '#fff' }
                  : { background: THEME.colors.charcoalMid, color: THEME.colors.muted }}
              >
                {s === 'all' ? 'Todos os turnos' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px,1fr] gap-6">
          {/* Available Collaborators Squad */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider">
              Colaboradores Disponíveis ({availableCollabs.length})
            </div>
            <div className="space-y-2">
              {availableCollabs.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-white/8">
                  <p className="text-xs text-white/25">Todos alocados ou sem colaboradores no turno.</p>
                </div>
              ) : (
                availableCollabs.map(c => <DraggableCollabCard key={c.id} collab={c} />)
              )}
            </div>
          </div>

          {/* Machine Drop Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-min">
            {machines.map(machine => (
              <MachineDropSlot
                key={machine.id}
                machine={machine}
                activeCollabId={allocations[machine.id]}
                result={qualResults[machine.id] ?? null}
                onUnallocate={() => unallocateMachine(machine.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag Overlay Ghost */}
      <DragOverlay>
        {draggedCollab && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/20 shadow-2xl scale-105" style={{ background: THEME.colors.charcoal }}>
            <div className="w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center text-white" style={{ background: THEME.colors.red }}>
              {draggedCollab.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{draggedCollab.name}</div>
              <div className="text-xs" style={{ color: THEME.colors.muted }}>{ROLE_LABELS[draggedCollab.role]}</div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
