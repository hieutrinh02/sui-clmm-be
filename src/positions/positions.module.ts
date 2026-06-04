import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { PositionsResolver } from './positions.resolver';
import { PositionsService } from './positions.service';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService, PositionsResolver],
  exports: [PositionsService],
})
export class PositionsModule {}
