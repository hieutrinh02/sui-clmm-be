import { Args, Query, Resolver } from '@nestjs/graphql';
import { PoolModel } from '../models';
import { PoolsService } from './pools.service';

@Resolver(() => PoolModel)
export class PoolsResolver {
  constructor(private readonly poolsService: PoolsService) {}

  @Query(() => [PoolModel])
  pools() {
    return this.poolsService.findAll();
  }

  @Query(() => PoolModel)
  pool(@Args('id') id: string) {
    return this.poolsService.findById(id);
  }
}
