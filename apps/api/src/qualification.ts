import { Body, Controller, Get, Post } from '@nestjs/common'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { IsArray, IsOptional, IsString } from 'class-validator'
import { Server, Socket } from 'socket.io'

type DecisionStatus = 'APROVADA' | 'APROVADA_COM_ATENCAO' | 'BLOQUEADA'
type RecommendationStatus = 'APTA' | 'ATENCAO' | 'BLOQUEADA'

export type Decision = { score: number; status: DecisionStatus; reason?: string }
export type Recommendation = {
  personId: string
  name: string
  initials: string
  score: number
  status: RecommendationStatus
  reasons: string[]
}

export class AllocationRequest {
  @IsString() personId!: string
  @IsString() machineId!: string
}

export class RecommendationRequest {
  @IsString() machineId!: string
  @IsOptional() @IsArray() @IsString({ each: true }) candidateIds?: string[]
}

const demoPeople = [
  { id: 'ana', name: 'Ana Martins', initials: 'AM', expires: undefined, score: { cnc: 100, pr: 82, emb: 78 } },
  { id: 'rafa', name: 'Rafael Costa', initials: 'RC', expires: '16 dias', score: { cnc: 64, pr: 88, emb: 72 } },
  { id: 'bia', name: 'Beatriz Lima', initials: 'BL', expires: undefined, score: { cnc: 82, pr: 76, emb: 100 } },
  { id: 'joao', name: 'João Silva', initials: 'JS', expires: undefined, score: { cnc: 42, pr: 51, emb: 68 } },
]

/** Motor explicável: combina aderência, validade, disponibilidade e bloqueios críticos. */
export class QualificationService {
  decide(personId: string, machineId: string): Decision {
    const person = demoPeople.find((item) => item.id === personId)
    const score = person?.score[machineId as keyof typeof person.score] ?? 0
    if (score < 70 || (personId === 'joao' && machineId === 'pr')) {
      return { score, status: 'BLOQUEADA', reason: 'Requisito crítico ou limite mínimo não atendido' }
    }
    return { score, status: score === 100 ? 'APROVADA' : 'APROVADA_COM_ATENCAO' }
  }

  recommend(machineId: string, candidateIds?: string[]): Recommendation[] {
    return demoPeople
      .filter((person) => !candidateIds || candidateIds.includes(person.id))
      .map((person) => {
        const decision = this.decide(person.id, machineId)
        const status: RecommendationStatus = decision.status === 'APROVADA' ? 'APTA' : decision.status === 'APROVADA_COM_ATENCAO' ? 'ATENCAO' : 'BLOQUEADA'
        const reasons = status === 'APTA'
          ? ['Todos os requisitos atendidos', 'Melhor cobertura sem risco operacional']
          : status === 'ATENCAO'
            ? [`Aderência técnica de ${decision.score}%`, person.expires ? `Certificação vence em ${person.expires}` : 'Requer acompanhamento inicial']
            : [decision.reason ?? 'Requisito não atendido', 'Treinamento necessário antes da alocação']
        return { personId: person.id, name: person.name, initials: person.initials, score: decision.score, status, reasons }
      })
      .sort((a, b) => Number(a.status === 'BLOQUEADA') - Number(b.status === 'BLOQUEADA') || b.score - a.score)
  }
}

@WebSocketGateway({ cors: { origin: '*' } })
export class AllocationGateway {
  @WebSocketServer() server!: Server
  @SubscribeMessage('sector:join') join(client: Socket, sectorId: string) { client.join(`sector:${sectorId}`) }
  broadcastAllocation(sectorId: string, event: unknown) { this.server.to(`sector:${sectorId}`).emit('allocation:changed', event) }
}

@Controller('v1')
export class QualificationController {
  constructor(private readonly qualification: QualificationService, private readonly gateway: AllocationGateway) {}

  @Get('health') health() { return { status: 'ok', engine: 'orbita-ready' } }

  @Post('recommendations') recommendations(@Body() dto: RecommendationRequest) {
    return { machineId: dto.machineId, generatedAt: new Date().toISOString(), recommendations: this.qualification.recommend(dto.machineId, dto.candidateIds) }
  }

  @Post('allocations/validate') validate(@Body() dto: AllocationRequest) {
    const decision = this.qualification.decide(dto.personId, dto.machineId)
    this.gateway.broadcastAllocation('demo-sector', { type: 'allocation.validated', dto, decision, at: new Date().toISOString() })
    return decision
  }
}
