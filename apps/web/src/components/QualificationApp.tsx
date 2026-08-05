import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3, Cpu, Grid3x3, LayoutGrid, Settings, Users
} from 'lucide-react'
import { THEME } from '../design/theme3M'
import { DepartmentManager } from './qualification/DepartmentManager'
import { MachineManager } from './qualification/MachineManager'
import { CollaboratorManager } from './qualification/CollaboratorManager'
import { MatrixGrid } from './qualification/MatrixGrid'
import { AllocationBoard } from './qualification/AllocationBoard'
import { ManagementInsights } from './qualification/ManagementInsights'
import { useQualificationStore } from '../store/qualificationStore'
import { calculateQualification } from '../store/qualificationEngine'

type Tab = 'allocation' | 'matrix' | 'machines' | 'departments' | 'collaborators' | 'insights'

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'allocation',    label: 'Alocação',       icon: LayoutGrid },
  { id: 'matrix',       label: 'Matriz',          icon: Grid3x3 },
  { id: 'insights',     label: 'Insights',        icon: BarChart3 },
  { id: 'machines',     label: 'Máquinas',        icon: Cpu },
  { id: 'departments',  label: 'Departamentos',   icon: Settings },
  { id: 'collaborators',label: 'Colaboradores',   icon: Users },
]

function StatusChip({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      {count} {label}
    </div>
  )
}

export function QualificationApp() {
  const [tab, setTab] = useState<Tab>('allocation')
  const { machines, collaborators, skills, allocations } = useQualificationStore()

  // Live summary counts
  const allocated = Object.keys(allocations).length
  const aptoCount = machines.filter(m => {
    const cId = allocations[m.id]
    if (!cId) return false
    const c = collaborators.find(x => x.id === cId)
    if (!c) return false
    const r = calculateQualification(c, m, skills)
    return r.status === 'APROVADO' || r.status === 'ATENCAO'
  }).length
  const inaptoCount = allocated - aptoCount

  const Component = {
    allocation:    AllocationBoard,
    matrix:        MatrixGrid,
    insights:      ManagementInsights,
    machines:      MachineManager,
    departments:   DepartmentManager,
    collaborators: CollaboratorManager,
  }[tab]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: THEME.colors.charcoal, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/8 backdrop-blur-xl" style={{ background: 'rgba(30,30,30,0.95)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-14">
            {/* Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg"
                style={{ background: THEME.colors.red }}
              >
                MQ
              </div>
              <span className="font-bold text-white text-sm tracking-tight hidden sm:block">
                Matriz de Qualificação
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            {/* Live Status Chips */}
            <div className="hidden sm:flex items-center gap-4">
              <StatusChip count={machines.length} color={THEME.colors.muted} label="máquinas" />
              <StatusChip count={collaborators.length} color={THEME.colors.muted} label="colaboradores" />
              <StatusChip count={aptoCount} color={THEME.colors.aprovado} label="aptos" />
              {inaptoCount > 0 && <StatusChip count={inaptoCount} color={THEME.colors.reprovado} label="inaptos" />}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Tab Nav */}
            <nav className="flex items-center gap-0.5">
              {TABS.map(t => {
                const Icon = t.icon
                const isActive = tab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={isActive
                      ? { background: THEME.colors.red, color: '#fff' }
                      : { color: THEME.colors.muted }
                    }
                    title={t.label}
                  >
                    <Icon size={14} />
                    <span className="hidden md:inline">{t.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Component />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
