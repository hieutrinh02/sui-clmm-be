import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PositionModel, PoolModel, SwapModel } from '../models';
import { PositionsService } from '../positions/positions.service';
import { SwapsService } from '../swaps/swaps.service';
import { PoolsService } from './pools.service';

@ApiTags('pools')
@Controller('pools')
export class PoolsController {
  constructor(
    private readonly pools: PoolsService,
    private readonly positions: PositionsService,
    private readonly swaps: SwapsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: [PoolModel] })
  findAll() {
    return this.pools.findAll();
  }

  @Get(':poolId')
  @ApiOkResponse({ type: PoolModel })
  findById(@Param('poolId') poolId: string) {
    return this.pools.findById(poolId);
  }

  @Get(':poolId/positions')
  @ApiOkResponse({ type: [PositionModel] })
  findPositions(@Param('poolId') poolId: string) {
    return this.positions.findAll({ poolId });
  }

  @Get(':poolId/swaps')
  @ApiOkResponse({ type: [SwapModel] })
  findSwaps(@Param('poolId') poolId: string) {
    return this.swaps.findAll({ poolId });
  }
}
