import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Collaborator,
  Department,
  Machine,
  MachineSkillRequirement,
  Role,
  Shift,
  Skill,
} from '../types/qualification'

interface QualificationState {
  departments: Department[]
  machines: Machine[]
  skills: Skill[]
  collaborators: Collaborator[]
  allocations: Record<string, string> // machineId -> collaboratorId

  // Department Actions
  addDepartment: (dept: Omit<Department, 'id'>) => void
  updateDepartment: (id: string, data: Partial<Department>) => void
  archiveDepartment: (id: string) => void

  // Machine Actions
  addMachine: (machine: Omit<Machine, 'id' | 'x' | 'y'>) => void
  updateMachine: (id: string, data: Partial<Machine>) => void
  updateMachineSkills: (machineId: string, requirements: MachineSkillRequirement[]) => void
  updateMachinePosition: (machineId: string, x: number, y: number) => void

  // Skill Actions
  addSkill: (skill: Omit<Skill, 'id'>) => void
  updateSkill: (id: string, data: Partial<Skill>) => void

  // Collaborator Actions
  addCollaborator: (collab: Omit<Collaborator, 'id'>) => void
  toggleCollaboratorSkill: (collaboratorId: string, skillId: string) => void
  updateCollaboratorRole: (collaboratorId: string, role: Role) => void

  // Allocation Actions
  allocateCollaborator: (machineId: string, collaboratorId: string) => void
  unallocateMachine: (machineId: string) => void
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-usinagem', name: 'Usinagem CNC', color: '#CC0000' },
  { id: 'dept-[#1E1E1E]', name: 'Conformação & Prensas', color: '#1E1E1E' },
  { id: 'dept-expedicao', name: 'Expedição & Embalagem', color: '#888888' },
]

const INITIAL_SKILLS: Skill[] = [
  { id: 'sk-cnc-op', name: 'Operação CNC', description: 'Operação básica de centros de usinagem 3/5 eixos', departmentId: 'dept-usinagem' },
  { id: 'sk-nr12', name: 'NR-12 Segurança Crítica', description: 'Certificação de segurança de máquinas e prensas', departmentId: 'dept-usinagem' },
  { id: 'sk-metrologia', name: 'Metrologia N3', description: 'Leitura de micrômetros, paquímetros e traçadores', departmentId: 'dept-usinagem' },
  { id: 'sk-prensa-hyd', name: 'Prensa Hidráulica 500T', description: 'Regulagem e estampagem pesada', departmentId: 'dept-[#1E1E1E]' },
  { id: 'sk-embalagem', name: 'Embalagem Automática', description: 'Rotulagem e paletização robotizada', departmentId: 'dept-expedicao' },
  { id: 'sk-inspecao', name: 'Inspeção Visual ISO', description: 'Controle estatístico de qualidade visual', departmentId: 'dept-expedicao' },
]

const INITIAL_MACHINES: Machine[] = [
  {
    id: 'mach-cnc-01',
    code: 'CNC-04',
    name: 'Centro de Usinagem 5 Eixos',
    departmentId: 'dept-usinagem',
    minRole: 'OPERADOR_B',
    requiredSkills: [
      { skillId: 'sk-cnc-op', mandatory: true },
      { skillId: 'sk-nr12', mandatory: true, critical: true },
      { skillId: 'sk-metrologia', mandatory: false },
    ],
    requiredHeadcount: 1,
    shifts: ['1T', '2T', '3T'],
    x: 80,
    y: 60,
  },
  {
    id: 'mach-pr-12',
    code: 'PR-12',
    name: 'Prensa Hidráulica 500T',
    departmentId: 'dept-[#1E1E1E]',
    minRole: 'OPERADOR_A',
    requiredSkills: [
      { skillId: 'sk-prensa-hyd', mandatory: true },
      { skillId: 'sk-nr12', mandatory: true, critical: true },
    ],
    requiredHeadcount: 1,
    shifts: ['1T', '2T'],
    x: 320,
    y: 60,
  },
  {
    id: 'mach-emb-02',
    code: 'EMB-02',
    name: 'Estação de Embalagem',
    departmentId: 'dept-expedicao',
    minRole: 'OPERADOR_C',
    requiredSkills: [
      { skillId: 'sk-embalagem', mandatory: true },
      { skillId: 'sk-inspecao', mandatory: true },
    ],
    requiredHeadcount: 1,
    shifts: ['1T', '2T', '3T'],
    x: 560,
    y: 60,
  },
]

const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'col-ana',
    name: 'Ana Martins',
    role: 'OPERADOR_A',
    shift: '1T',
    avatar3DPreset: 'avatar-1',
    skillIds: ['sk-cnc-op', 'sk-nr12', 'sk-metrologia'],
  },
  {
    id: 'col-rafa',
    name: 'Rafael Costa',
    role: 'OPERADOR_B',
    shift: '1T',
    avatar3DPreset: 'avatar-2',
    skillIds: ['sk-prensa-hyd'], // Missing NR-12 critical
  },
  {
    id: 'col-bia',
    name: 'Beatriz Lima',
    role: 'FACILITADOR',
    shift: '2T',
    avatar3DPreset: 'avatar-3',
    skillIds: ['sk-cnc-op', 'sk-nr12', 'sk-metrologia', 'sk-embalagem', 'sk-inspecao'],
  },
  {
    id: 'col-joao',
    name: 'João Silva',
    role: 'OPERADOR_D',
    shift: '1T',
    avatar3DPreset: 'avatar-4',
    skillIds: ['sk-embalagem'],
  },
]

export const useQualificationStore = create<QualificationState>()(
  persist(
    (set) => ({
      departments: INITIAL_DEPARTMENTS,
      machines: INITIAL_MACHINES,
      skills: INITIAL_SKILLS,
      collaborators: INITIAL_COLLABORATORS,
      allocations: {
        'mach-cnc-01': 'col-ana',
      },

      addDepartment: (dept) =>
        set((state) => ({
          departments: [...state.departments, { ...dept, id: `dept-${Date.now()}` }],
        })),

      updateDepartment: (id, data) =>
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, ...data } : d)),
        })),

      archiveDepartment: (id) =>
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, archived: true } : d)),
        })),

      addMachine: (machine) =>
        set((state) => ({
          machines: [
            ...state.machines,
            { ...machine, id: `mach-${Date.now()}`, x: 100, y: 100 },
          ],
        })),

      updateMachine: (id, data) =>
        set((state) => ({
          machines: state.machines.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      updateMachineSkills: (machineId, requirements) =>
        set((state) => ({
          machines: state.machines.map((m) =>
            m.id === machineId ? { ...m, requiredSkills: requirements } : m
          ),
        })),

      updateMachinePosition: (machineId, x, y) =>
        set((state) => ({
          machines: state.machines.map((m) => (m.id === machineId ? { ...m, x, y } : m)),
        })),

      addSkill: (skill) =>
        set((state) => ({
          skills: [...state.skills, { ...skill, id: `sk-${Date.now()}` }],
        })),

      updateSkill: (id, data) =>
        set((state) => ({
          skills: state.skills.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      addCollaborator: (collab) =>
        set((state) => ({
          collaborators: [
            ...state.collaborators,
            { ...collab, id: `col-${Date.now()}` },
          ],
        })),

      toggleCollaboratorSkill: (collaboratorId, skillId) =>
        set((state) => ({
          collaborators: state.collaborators.map((c) => {
            if (c.id !== collaboratorId) return c
            const exists = c.skillIds.includes(skillId)
            const updated = exists
              ? c.skillIds.filter((id) => id !== skillId)
              : [...c.skillIds, skillId]
            return { ...c, skillIds: updated }
          }),
        })),

      updateCollaboratorRole: (collaboratorId, role) =>
        set((state) => ({
          collaborators: state.collaborators.map((c) =>
            c.id === collaboratorId ? { ...c, role } : c
          ),
        })),

      allocateCollaborator: (machineId, collaboratorId) =>
        set((state) => ({
          allocations: { ...state.allocations, [machineId]: collaboratorId },
        })),

      unallocateMachine: (machineId) =>
        set((state) => {
          const next = { ...state.allocations }
          delete next[machineId]
          return { allocations: next }
        }),
    }),
    {
      name: 'matriz-qualificacao-storage-v1',
    }
  )
)
