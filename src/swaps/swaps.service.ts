import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { SwapModel } from '../models';
import { mapSwap } from '../row-mappers';

export type SwapFilters = {
  poolId?: string;
  sender?: string;
};

@Injectable()
export class SwapsService {
  constructor(private readonly db: DbService) {}

  async findAll(filters: SwapFilters = {}): Promise<SwapModel[]> {
    const where: string[] = [];
    const params: string[] = [];

    if (filters.poolId) {
      params.push(filters.poolId);
      where.push(`pool_id = $${params.length}`);
    }

    if (filters.sender) {
      params.push(filters.sender);
      where.push(`sender = $${params.length}`);
    }

    const sql = `select * from swaps ${
      where.length > 0 ? `where ${where.join(' and ')}` : ''
    } order by timestamp_ms desc, created_at desc`;
    const result = await this.db.query(sql, params);
    return result.rows.map(mapSwap);
  }
}
