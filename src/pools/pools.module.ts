import { Module } from '@nestjs/common';
import { PositionsModule } from '../positions/positions.module';
import { SwapsModule } from '../swaps/swaps.module';
import { PoolsController } from './pools.controller';
import { PoolsResolver } from './pools.resolver';
import { PoolsService } from './pools.service';

@Module({
  imports: [PositionsModule, SwapsModule],
  controllers: [PoolsController],
  providers: [PoolsService, PoolsResolver],
  exports: [PoolsService],
})
export class PoolsModule {}
