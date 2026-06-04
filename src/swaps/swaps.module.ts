import { Module } from '@nestjs/common';
import { SwapsResolver } from './swaps.resolver';
import { SwapsService } from './swaps.service';

@Module({
  providers: [SwapsService, SwapsResolver],
  exports: [SwapsService],
})
export class SwapsModule {}
