import { Body, Controller, Get, Post } from '@nestjs/common'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { IsString } from 'class-validator'
import { Server, Socket } from 'socket.io'

export type Decision = { score: number; status: 'APROVADA'|'APROVADA_COM_ATENCAO'|'BLOQUEADA'; reason?: string }
export class AllocationRequest { @IsString() personId!: string; @IsString() machineId!: string }
/** Domain rule: real app replaces demo scores with Prisma qualifications and machine requirements. */
export class QualificationService {
  decide(personId: string, machineId: string): Decision { const score = ({ ana: { cnc: 100, pr: 88, emb: 78 }, rafa: { cnc: 64, pr: 100, emb: 72 }, bia: { cnc: 82, pr: 76, emb: 100 }, joao: { cnc: 42, pr: 51, emb: 68 } } as Record<string, Record<string, number>>)[personId]?.[machineId] || 0; if (score < 70 || (personId === 'joao' && machineId === 'pr')) return { score, status: 'BLOQUEADA', reason: 'Requisito crítico não atendido' }; return { score, status: score === 100 ? 'APROVADA' : 'APROVADA_COM_ATENCAO' } }
}
@WebSocketGateway({ cors: { origin: '*' } })
export class AllocationGateway {
  @WebSocketServer() server!: Server
  @SubscribeMessage('sector:join') join(client: Socket, sectorId: string) { client.join(`sector:${sectorId}`) }
  broadcastAllocation(sectorId: string, event: unknown) { this.server.to(`sector:${sectorId}`).emit('allocation:changed', event) }
}
@Controller('v1') export class QualificationController {
  constructor(private readonly qualification: QualificationService, private readonly gateway: AllocationGateway) {}
  @Get('health') health() { return { status: 'ok' } }
  @Post('allocations/validate') validate(@Body() dto: AllocationRequest) { const decision = this.qualification.decide(dto.personId, dto.machineId); this.gateway.broadcastAllocation('demo-sector', { type: 'allocation.validated', dto, decision, at: new Date().toISOString() }); return decision }
}
