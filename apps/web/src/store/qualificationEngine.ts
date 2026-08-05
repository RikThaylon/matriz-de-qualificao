import {
  Collaborator,
  Machine,
  QualificationResult,
  ROLE_HIERARCHY,
  Skill,
} from '../types/qualification'

/**
 * Pure Calculation Engine for Matriz de Qualificação Inteligente
 * 
 * Enforces the audited business logic:
 * 1. Role Gate: Binary check evaluated BEFORE % calculation. If collaborator role < minRole, outcome is immediately BLOQUEADO.
 * 2. Critical Safety Lock: If any required skill is marked critical and collaborator lacks it, outcome is immediately REPROVADO.
 * 3. Exact Threshold Boundaries:
 *    - Role < minRole -> BLOQUEADO (Inapto - Blocked animation)
 *    - Missing Critical Skill -> REPROVADO (Inapto - Crying animation)
 *    - Score < 70% -> REPROVADO (Inapto - Crying animation)
 *    - 70% <= Score < 100% -> ATENCAO (Apto com ressalva - Neutral expression + Yellow alert)
 *    - Score == 100% -> APROVADO (Apto - Smiling animation)
 */
export function calculateQualification(
  collaborator: Collaborator,
  machine: Machine,
  allSkills: Skill[]
): QualificationResult {
  // Rule 1: Role Gate Pre-filter
  const colRoleRank = ROLE_HIERARCHY[collaborator.role] || 0
  const minRoleRank = ROLE_HIERARCHY[machine.minRole] || 0
  const roleGatePassed = colRoleRank >= minRoleRank

  if (!roleGatePassed) {
    return {
      collaboratorId: collaborator.id,
      machineId: machine.id,
      roleGatePassed: false,
      scorePercent: 0,
      missingCriticalSkills: [],
      missingMandatorySkills: [],
      status: 'BLOQUEADO',
      statusLabel: 'Cargo Inexistente / Inapto (Bloqueado)',
      animationReaction: 'blocked',
    }
  }

  // Rule 2 & 3: Mandatory & Critical Skill Adherence
  const ownedSet = new Set(collaborator.skillIds)
  const mandatoryReqs = machine.requiredSkills.filter((r) => r.mandatory)
  const criticalReqs = machine.requiredSkills.filter((r) => r.critical)

  const missingCriticalSkills: string[] = []
  const missingMandatorySkills: string[] = []

  for (const req of criticalReqs) {
    if (!ownedSet.has(req.skillId)) {
      const skillName = allSkills.find((s) => s.id === req.skillId)?.name || req.skillId
      missingCriticalSkills.push(skillName)
    }
  }

  for (const req of mandatoryReqs) {
    if (!ownedSet.has(req.skillId)) {
      const skillName = allSkills.find((s) => s.id === req.skillId)?.name || req.skillId
      missingMandatorySkills.push(skillName)
    }
  }

  // Edge case: if 0 mandatory skills required, score is 100%
  let scorePercent = 100
  if (mandatoryReqs.length > 0) {
    const ownedMandatoryCount = mandatoryReqs.length - missingMandatorySkills.length
    scorePercent = Math.round((ownedMandatoryCount / mandatoryReqs.length) * 100)
  }

  // Critical Safety Skill Failure Override
  if (missingCriticalSkills.length > 0) {
    return {
      collaboratorId: collaborator.id,
      machineId: machine.id,
      roleGatePassed: true,
      scorePercent,
      missingCriticalSkills,
      missingMandatorySkills,
      status: 'REPROVADO',
      statusLabel: 'Requisito Crítico de Segurança Ausente',
      animationReaction: 'crying',
    }
  }

  // Boundary checks
  if (scorePercent < 70) {
    return {
      collaboratorId: collaborator.id,
      machineId: machine.id,
      roleGatePassed: true,
      scorePercent,
      missingCriticalSkills,
      missingMandatorySkills,
      status: 'REPROVADO',
      statusLabel: `Aderência de ${scorePercent}% (Abaixo do mínimo de 70%)`,
      animationReaction: 'crying',
    }
  }

  if (scorePercent >= 70 && scorePercent < 100) {
    return {
      collaboratorId: collaborator.id,
      machineId: machine.id,
      roleGatePassed: true,
      scorePercent,
      missingCriticalSkills,
      missingMandatorySkills,
      status: 'ATENCAO',
      statusLabel: `Apto com Ressalva (${scorePercent}%)`,
      animationReaction: 'neutral',
    }
  }

  return {
    collaboratorId: collaborator.id,
    machineId: machine.id,
    roleGatePassed: true,
    scorePercent: 100,
    missingCriticalSkills: [],
    missingMandatorySkills: [],
    status: 'APROVADO',
    statusLabel: '100% Apto - Total Conformidade',
    animationReaction: 'happy',
  }
}
