export type Role = 'OPERADOR_D' | 'OPERADOR_C' | 'OPERADOR_B' | 'OPERADOR_A' | 'FACILITADOR'
export type Shift = '1T' | '2T' | '3T'
export type QualificationStatus = 'BLOQUEADO' | 'REPROVADO' | 'ATENCAO' | 'APROVADO'

export const ROLE_HIERARCHY: Record<Role, number> = {
  OPERADOR_D: 1,
  OPERADOR_C: 2,
  OPERADOR_B: 3,
  OPERADOR_A: 4,
  FACILITADOR: 5,
}

export const ROLE_LABELS: Record<Role, string> = {
  OPERADOR_D: 'Operador D',
  OPERADOR_C: 'Operador C',
  OPERADOR_B: 'Operador B',
  OPERADOR_A: 'Operador A',
  FACILITADOR: 'Facilitador',
}

export interface Department {
  id: string
  name: string
  color: string
  archived?: boolean
}

export interface Skill {
  id: string
  name: string
  description: string
  departmentId: string
}

export interface MachineSkillRequirement {
  skillId: string
  mandatory: boolean
  critical?: boolean // Safety critical NR-12 skill
}

export interface Machine {
  id: string
  name: string
  code: string
  departmentId: string
  minRole: Role
  requiredSkills: MachineSkillRequirement[]
  requiredHeadcount: number
  shifts: Shift[]
  x: number // Layout canvas position X
  y: number // Layout canvas position Y
}

export interface Collaborator {
  id: string
  name: string
  role: Role
  shift: Shift
  avatar3DPreset: string
  skillIds: string[]
}

export interface QualificationResult {
  collaboratorId: string
  machineId: string
  roleGatePassed: boolean
  scorePercent: number
  missingCriticalSkills: string[]
  missingMandatorySkills: string[]
  status: QualificationStatus
  statusLabel: string
  animationReaction: 'happy' | 'neutral' | 'crying' | 'blocked'
}
