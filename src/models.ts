import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class PoolModel {
  @ApiProperty()
  @Field()
  id!: string;

  @ApiProperty()
  @Field()
  factoryId!: string;

  @ApiProperty()
  @Field()
  typeX!: string;

  @ApiProperty()
  @Field()
  typeY!: string;

  @ApiProperty()
  @Field()
  admin!: string;

  @ApiProperty()
  @Field()
  feeBps!: string;

  @ApiProperty()
  @Field()
  tickSpacing!: number;

  @ApiProperty()
  @Field()
  sqrtPriceX64!: string;

  @ApiProperty()
  @Field()
  currentTick!: number;

  @ApiProperty()
  @Field()
  liquidity!: string;

  @ApiProperty()
  @Field()
  createdTxDigest!: string;

  @ApiProperty()
  @Field()
  updatedTxDigest!: string;

  @ApiProperty()
  @Field()
  createdAt!: Date;

  @ApiProperty()
  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class PositionModel {
  @ApiProperty()
  @Field()
  id!: string;

  @ApiProperty()
  @Field()
  poolId!: string;

  @ApiProperty()
  @Field()
  owner!: string;

  @ApiProperty()
  @Field()
  typeX!: string;

  @ApiProperty()
  @Field()
  typeY!: string;

  @ApiProperty()
  @Field()
  tickLower!: number;

  @ApiProperty()
  @Field()
  tickUpper!: number;

  @ApiProperty()
  @Field()
  liquidity!: string;

  @ApiProperty()
  @Field()
  amountX!: string;

  @ApiProperty()
  @Field()
  amountY!: string;

  @ApiProperty()
  @Field()
  createdTxDigest!: string;

  @ApiProperty()
  @Field()
  updatedTxDigest!: string;

  @ApiProperty()
  @Field()
  createdAt!: Date;

  @ApiProperty()
  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class SwapModel {
  @ApiProperty()
  @Field()
  id!: string;

  @ApiProperty()
  @Field()
  poolId!: string;

  @ApiProperty()
  @Field()
  sender!: string;

  @ApiProperty()
  @Field()
  typeX!: string;

  @ApiProperty()
  @Field()
  typeY!: string;

  @ApiProperty()
  @Field()
  zeroForOne!: boolean;

  @ApiProperty()
  @Field()
  amountIn!: string;

  @ApiProperty()
  @Field()
  amountOut!: string;

  @ApiProperty()
  @Field()
  feeAmount!: string;

  @ApiProperty()
  @Field()
  sqrtPriceX64!: string;

  @ApiProperty()
  @Field()
  liquidity!: string;

  @ApiProperty()
  @Field()
  tick!: number;

  @ApiProperty()
  @Field()
  txDigest!: string;

  @ApiProperty()
  @Field()
  eventSeq!: string;

  @ApiProperty()
  @Field()
  timestampMs!: string;

  @ApiProperty()
  @Field()
  createdAt!: Date;
}
