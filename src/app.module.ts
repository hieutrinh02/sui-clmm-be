import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { IndexerModule } from './indexer/indexer.module';
import { PoolsModule } from './pools/pools.module';
import { PositionsModule } from './positions/positions.module';
import { SwapsModule } from './swaps/swaps.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      sortSchema: true,
    }),
    DbModule,
    HealthModule,
    PoolsModule,
    PositionsModule,
    SwapsModule,
    IndexerModule,
  ],
})
export class AppModule {}
