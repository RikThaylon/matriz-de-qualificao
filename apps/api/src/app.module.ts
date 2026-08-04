import { Module } from '@nestjs/common'
import { AllocationGateway, QualificationController, QualificationService } from './qualification'
@Module({ controllers: [QualificationController], providers: [QualificationService, AllocationGateway] })
export class AppModule {}
