import { Args, Query, Resolver } from '@nestjs/graphql';
import { SwapModel } from '../models';
import { SwapsService } from './swaps.service';

@Resolver(() => SwapModel)
export class SwapsResolver {
  constructor(private readonly swapsService: SwapsService) {}

  @Query(() => [SwapModel])
  swaps(
    @Args('poolId', { nullable: true }) poolId?: string,
    @Args('sender', { nullable: true }) sender?: string,
  ) {
    return this.swapsService.findAll({ poolId, sender });
  }
}
