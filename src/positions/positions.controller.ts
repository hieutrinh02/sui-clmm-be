import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PositionModel } from '../models';
import { PositionsService } from './positions.service';

@ApiTags('positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get()
  @ApiQuery({ name: 'owner', required: false })
  @ApiOkResponse({ type: [PositionModel] })
  findAll(@Query('owner') owner?: string) {
    return this.positions.findAll({ owner });
  }

  @Get(':positionId')
  @ApiOkResponse({ type: PositionModel })
  findById(@Param('positionId') positionId: string) {
    return this.positions.findById(positionId);
  }
}
