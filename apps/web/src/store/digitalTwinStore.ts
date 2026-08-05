import { create } from 'zustand'

export type MachineState = 'apto' | 'atencao' | 'bloqueado' | 'vazio' | 'parada'

export interface MachineData {
  id: string
  code: string
  name: string
  type: 'Usinagem' | 'Conformação' | 'Expedição' | 'Robotica' | 'Inspeção'
  position: [number, number, number]
  rotation: number
  state: MachineState
  operatorId?: string
  operatorName?: string
  oee: number
  temperature: number // °C
  vibration: number // mm/s
  cycleTime: number // sec
  powerKw: number
  requiredSkills: string[]
}

export interface OperatorData {
  id: string
  name: string
  initials: string
  role: string
  shift: string
  color: string
  position: [number, number, number]
  targetPosition: [number, number, number]
  assignedMachineId?: string
  status: 'idle' | 'walking' | 'operating' | 'inspecting' | 'waiting'
  skills: { name: string; level: number; expired?: boolean }[]
  certifications: string[]
  experienceYears: number
  safetyScore: number
}

export interface AIRecommendation {
  operatorId: string
  machineId: string
  score: number
  status: 'APTA' | 'ATENCAO' | 'BLOQUEADA'
  reasons: string[]
  expectedOEE: number
  riskReduction: string
  knowledgeCoverage: number
  certExpiryNotice?: string
}

interface DigitalTwinState {
  // Data State
  machines: MachineData[]
  operators: OperatorData[]
  selectedMachineId: string | null
  selectedOperatorId: string | null
  draggedOperatorId: string | null
  hoveredMachineId: string | null
  
  // HUD UI State
  isCommandPaletteOpen: boolean
  isAiModalOpen: boolean
  aiTargetMachineId: string | null
  aiRecommendations: AIRecommendation[]
  emergencyStopActive: boolean
  cameraMode: 'overview' | 'focusMachine' | 'focusOperator'
  cameraTarget: [number, number, number]
  heatmapMode: 'off' | 'thermal' | 'traffic' | 'stress'

  // Telemetry Metrics
  plantOEE: number
  activeOperatorsCount: number
  operationalSafetyIndex: number

  // Actions
  setSelectedMachine: (id: string | null) => void
  setSelectedOperator: (id: string | null) => void
  setDraggedOperator: (id: string | null) => void
  setHoveredMachine: (id: string | null) => void
  setCommandPaletteOpen: (open: boolean) => void
  setAiModalOpen: (open: boolean, machineId?: string) => void
  assignOperatorToMachine: (operatorId: string, machineId: string) => void
  unassignOperator: (operatorId: string) => void
  triggerEmergencyStop: () => void
  resetEmergencyStop: () => void
  setCameraMode: (mode: 'overview' | 'focusMachine' | 'focusOperator', target?: [number, number, number]) => void
  setHeatmapMode: (mode: 'off' | 'thermal' | 'traffic' | 'stress') => void
  updateOperatorPosition: (operatorId: string, position: [number, number, number]) => void
  updateMachineMetrics: (machineId: string, metrics: Partial<MachineData>) => void
}

const INITIAL_MACHINES: MachineData[] = [
  {
    id: 'cnc-01',
    code: 'CNC-04',
    name: 'Centro de Usinagem 5 Eixos',
    type: 'Usinagem',
    position: [-10, 0, -5],
    rotation: 0,
    state: 'apto',
    operatorId: 'op-ana',
    operatorName: 'Ana Martins',
    oee: 94.2,
    temperature: 42.5,
    vibration: 1.2,
    cycleTime: 48,
    powerKw: 18.5,
    requiredSkills: ['CNC N4', 'Metrologia N3', 'NR-12'],
  },
  {
    id: 'press-01',
    code: 'PR-12',
    name: 'Prensa Hidráulica 500T',
    type: 'Conformação',
    position: [0, 0, -8],
    rotation: Math.PI / 2,
    state: 'atencao',
    operatorId: 'op-rafa',
    operatorName: 'Rafael Costa',
    oee: 81.5,
    temperature: 58.0,
    vibration: 3.8,
    cycleTime: 62,
    powerKw: 35.0,
    requiredSkills: ['Prensa N3', 'Segurança Crítica', 'NR-12'],
  },
  {
    id: 'emb-01',
    code: 'EMB-02',
    name: 'Estação de Embalagem Robotizada',
    type: 'Expedição',
    position: [10, 0, -5],
    rotation: 0,
    state: 'vazio',
    oee: 0.0,
    temperature: 24.1,
    vibration: 0.2,
    cycleTime: 0,
    powerKw: 4.2,
    requiredSkills: ['Inspeção Visual', 'Rastreabilidade', 'Ergonomia'],
  },
  {
    id: 'robot-01',
    code: 'ROB-09',
    name: 'Célula de Solda Robotizada',
    type: 'Robotica',
    position: [-6, 0, 8],
    rotation: Math.PI / 4,
    state: 'apto',
    operatorId: 'op-bia',
    operatorName: 'Beatriz Lima',
    oee: 98.1,
    temperature: 38.2,
    vibration: 0.8,
    cycleTime: 32,
    powerKw: 22.0,
    requiredSkills: ['Robótica ABB', 'Solda MIG N4'],
  },
  {
    id: 'inspect-01',
    code: 'INS-01',
    name: 'Estação 3D de Inspeção Qualidade',
    type: 'Inspeção',
    position: [6, 0, 8],
    rotation: -Math.PI / 4,
    state: 'vazio',
    oee: 0.0,
    temperature: 22.0,
    vibration: 0.1,
    cycleTime: 0,
    powerKw: 3.1,
    requiredSkills: ['Metrologia N4', 'Calibração ISO'],
  },
]

const SQUAD_BASE_POS: [number, number, number] = [0, 0, 16]

const INITIAL_OPERATORS: OperatorData[] = [
  {
    id: 'op-ana',
    name: 'Ana Martins',
    initials: 'AM',
    role: 'Operadora Plena',
    shift: 'Turno Alpha',
    color: '#00FF9D',
    position: [-10, 0, -2.5],
    targetPosition: [-10, 0, -2.5],
    assignedMachineId: 'cnc-01',
    status: 'operating',
    skills: [
      { name: 'CNC N4', level: 100 },
      { name: 'Metrologia N3', level: 85 },
      { name: 'NR-12', level: 100 },
    ],
    certifications: ['ISO 9001', 'NR-12 Válida', 'Operação CNC Sênior'],
    experienceYears: 6.5,
    safetyScore: 98,
  },
  {
    id: 'op-rafa',
    name: 'Rafael Costa',
    initials: 'RC',
    role: 'Operador Sênior',
    shift: 'Turno Alpha',
    color: '#FFB800',
    position: [0, 0, -5.5],
    targetPosition: [0, 0, -5.5],
    assignedMachineId: 'press-01',
    status: 'operating',
    skills: [
      { name: 'Prensa N3', level: 88 },
      { name: 'Segurança Crítica', level: 90 },
      { name: 'NR-12', level: 75, expired: true },
    ],
    certifications: ['NR-12 (Vence em 15 dias)', 'Prensas de Alta Tonelagem'],
    experienceYears: 8.2,
    safetyScore: 91,
  },
  {
    id: 'op-bia',
    name: 'Beatriz Lima',
    initials: 'BL',
    role: 'Técnica de Processos',
    shift: 'Turno Beta',
    color: '#00F3FF',
    position: [-6, 0, 10.5],
    targetPosition: [-6, 0, 10.5],
    assignedMachineId: 'robot-01',
    status: 'operating',
    skills: [
      { name: 'Robótica ABB', level: 95 },
      { name: 'Solda MIG N4', level: 92 },
      { name: 'Embalagem N4', level: 88 },
    ],
    certifications: ['Certificação ABB Robotics', 'Auditora de Qualidade'],
    experienceYears: 5.0,
    safetyScore: 99,
  },
  {
    id: 'op-joao',
    name: 'João Silva',
    initials: 'JS',
    role: 'Operador Trainee',
    shift: 'Turno Alpha',
    color: '#FF2A6D',
    position: [-4, 0, 16],
    targetPosition: [-4, 0, 16],
    status: 'waiting',
    skills: [
      { name: 'Embalagem N2', level: 68 },
      { name: 'Inspeção Visual', level: 60 },
    ],
    certifications: ['Treinamento Básico Industrial'],
    experienceYears: 1.1,
    safetyScore: 84,
  },
  {
    id: 'op-carla',
    name: 'Carla Mendez',
    initials: 'CM',
    role: 'Especialista Metrologia',
    shift: 'Turno Beta',
    color: '#A855F7',
    position: [4, 0, 16],
    targetPosition: [4, 0, 16],
    status: 'waiting',
    skills: [
      { name: 'Metrologia N4', level: 98 },
      { name: 'Calibração ISO', level: 96 },
      { name: 'Inspeção 3D', level: 94 },
    ],
    certifications: ['Metrologia Avançada Mitutoyo', 'Black Belt Six Sigma'],
    experienceYears: 9.0,
    safetyScore: 100,
  },
]

export const useDigitalTwinStore = create<DigitalTwinState>((set, get) => ({
  machines: INITIAL_MACHINES,
  operators: INITIAL_OPERATORS,
  selectedMachineId: 'cnc-01',
  selectedOperatorId: null,
  draggedOperatorId: null,
  hoveredMachineId: null,

  isCommandPaletteOpen: false,
  isAiModalOpen: false,
  aiTargetMachineId: null,
  aiRecommendations: [],
  emergencyStopActive: false,
  cameraMode: 'overview',
  cameraTarget: [0, 0, 0],
  heatmapMode: 'off',

  plantOEE: 91.3,
  activeOperatorsCount: 3,
  operationalSafetyIndex: 97.4,

  setSelectedMachine: (id) =>
    set((state) => {
      const machine = state.machines.find((m) => m.id === id)
      return {
        selectedMachineId: id,
        selectedOperatorId: null,
        cameraMode: machine ? 'focusMachine' : 'overview',
        cameraTarget: machine ? machine.position : [0, 0, 0],
      }
    }),

  setSelectedOperator: (id) =>
    set((state) => {
      const op = state.operators.find((o) => o.id === id)
      return {
        selectedOperatorId: id,
        selectedMachineId: null,
        cameraMode: op ? 'focusOperator' : 'overview',
        cameraTarget: op ? op.position : [0, 0, 0],
      }
    }),

  setDraggedOperator: (id) => set({ draggedOperatorId: id }),
  setHoveredMachine: (id) => set({ hoveredMachineId: id }),

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  setAiModalOpen: (open, machineId) => {
    if (!open) {
      set({ isAiModalOpen: false, aiTargetMachineId: null, aiRecommendations: [] })
      return
    }

    const targetMachineId = machineId || get().selectedMachineId || 'emb-01'
    const machine = get().machines.find((m) => m.id === targetMachineId)
    const operators = get().operators

    // Calculate explainable AI scores
    const recommendations: AIRecommendation[] = operators.map((op) => {
      let score = 50
      const reasons: string[] = []

      // Skill match logic
      const hasDirectSkill = op.skills.some((s) => machine?.requiredSkills.some((req) => s.name.includes(req.split(' ')[0])))
      if (hasDirectSkill) {
        score += 35
        reasons.push(`Alta compatibilidade técnica (${op.skills[0]?.name})`)
      } else {
        reasons.push('Treinamento complementar recomendado para especialidade')
      }

      // Safety certification check
      const isExpired = op.skills.some((s) => s.expired)
      if (isExpired) {
        score -= 20
        reasons.push('Certificação NR-12 com renovação pendente')
      }

      if (op.safetyScore >= 95) {
        score += 15
        reasons.push(`Índice de segurança exemplar (${op.safetyScore}%)`)
      }

      // Machine familiarity
      if (op.assignedMachineId === targetMachineId) {
        score += 10
        reasons.push('Operador já alocado no posto de trabalho')
      }

      const finalScore = Math.min(Math.max(score, 20), 100)
      const status: AIRecommendation['status'] = finalScore >= 80 ? 'APTA' : finalScore >= 55 ? 'ATENCAO' : 'BLOQUEADA'

      return {
        operatorId: op.id,
        machineId: targetMachineId,
        score: finalScore,
        status,
        reasons,
        expectedOEE: Math.round(finalScore * 0.95),
        riskReduction: finalScore >= 80 ? 'Risco Mitigado (-85%)' : 'Risco Moderado (-30%)',
        knowledgeCoverage: Math.round(finalScore * 0.98),
        certExpiryNotice: isExpired ? 'Vence em 15 dias' : undefined,
      }
    }).sort((a, b) => b.score - a.score)

    set({
      isAiModalOpen: true,
      aiTargetMachineId: targetMachineId,
      aiRecommendations: recommendations,
    })
  },

  assignOperatorToMachine: (operatorId, machineId) => {
    set((state) => {
      const machine = state.machines.find((m) => m.id === machineId)
      const operator = state.operators.find((o) => o.id === operatorId)
      if (!machine || !operator) return state

      // Target position in front of machine
      const targetPos: [number, number, number] = [
        machine.position[0],
        0,
        machine.position[2] + 2.5,
      ]

      const updatedOperators = state.operators.map((op) => {
        if (op.id === operatorId) {
          return {
            ...op,
            assignedMachineId: machineId,
            targetPosition: targetPos,
            status: 'walking' as const,
          }
        }
        // Unassign if another operator was assigned to this machine
        if (op.assignedMachineId === machineId) {
          return {
            ...op,
            assignedMachineId: undefined,
            targetPosition: [0, 0, 16] as [number, number, number],
            status: 'walking' as const,
          }
        }
        return op
      })

      const updatedMachines = state.machines.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            operatorId,
            operatorName: operator.name,
            state: 'apto' as const,
            oee: 92.5,
          }
        }
        return m
      })

      return {
        operators: updatedOperators,
        machines: updatedMachines,
        hoveredMachineId: null,
        draggedOperatorId: null,
      }
    })
  },

  unassignOperator: (operatorId) => {
    set((state) => {
      const operator = state.operators.find((o) => o.id === operatorId)
      if (!operator) return state

      const updatedOperators = state.operators.map((op) =>
        op.id === operatorId
          ? {
              ...op,
              assignedMachineId: undefined,
              targetPosition: [0, 0, 16] as [number, number, number],
              status: 'walking' as const,
            }
          : op
      )

      const updatedMachines = state.machines.map((m) =>
        m.operatorId === operatorId
          ? { ...m, operatorId: undefined, operatorName: undefined, state: 'vazio' as const, oee: 0 }
          : m
      )

      return { operators: updatedOperators, machines: updatedMachines }
    })
  },

  triggerEmergencyStop: () => {
    set((state) => ({
      emergencyStopActive: true,
      machines: state.machines.map((m) => ({ ...m, state: 'parada', oee: 0 })),
    }))
  },

  resetEmergencyStop: () => {
    set((state) => ({
      emergencyStopActive: false,
      machines: state.machines.map((m) => ({
        ...m,
        state: m.operatorId ? 'apto' : 'vazio',
        oee: m.operatorId ? 88.0 : 0,
      })),
    }))
  },

  setCameraMode: (mode, target) => {
    set({
      cameraMode: mode,
      cameraTarget: target || [0, 0, 0],
    })
  },

  setHeatmapMode: (mode) => set({ heatmapMode: mode }),

  updateOperatorPosition: (operatorId, position) => {
    set((state) => ({
      operators: state.operators.map((op) => {
        if (op.id !== operatorId) return op

        // Check if operator reached target
        const dist = Math.hypot(op.targetPosition[0] - position[0], op.targetPosition[2] - position[2])
        const reachedTarget = dist < 0.3
        const newStatus = reachedTarget
          ? op.assignedMachineId
            ? 'operating'
            : 'waiting'
          : 'walking'

        return { ...op, position, status: newStatus }
      }),
    }))
  },

  updateMachineMetrics: (machineId, metrics) => {
    set((state) => ({
      machines: state.machines.map((m) => (m.id === machineId ? { ...m, ...metrics } : m)),
    }))
  },
}))
