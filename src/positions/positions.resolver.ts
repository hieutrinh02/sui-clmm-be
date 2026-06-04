import { Args, Query, Resolver } from '@nestjs/graphql';
import { PositionModel } from '../models';
import { PositionsService } from './positions.service';

@Resolver(() => PositionModel)
export class PositionsResolver {
  constructor(private readonly positionsService: PositionsService) {}

  @Query(() => [PositionModel])
  positions(
    @Args('owner', { nullable: true }) owner?: string,
    @Args('poolId', { nullable: true }) poolId?: string,
  ) {
    return this.positionsService.findAll({ owner, poolId });
  }

  @Query(() => PositionModel)
  position(@Args('id') id: string) {
    return this.positionsService.findById(id);
  }
}
