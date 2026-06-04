import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { PositionModel } from '../models';
import { mapPosition } from '../row-mappers';

export type PositionFilters = {
  owner?: string;
  poolId?: string;
};

@Injectable()
export class PositionsService {
  constructor(private readonly db: DbService) {}

  async findAll(filters: PositionFilters = {}): Promise<PositionModel[]> {
    const where: string[] = [];
    const params: string[] = [];

    if (filters.owner) {
      params.push(filters.owner);
      where.push(`owner = $${params.length}`);
    }

    if (filters.poolId) {
      params.push(filters.poolId);
      where.push(`pool_id = $${params.length}`);
    }

    const sql = `select * from positions ${
      where.length > 0 ? `where ${where.join(' and ')}` : ''
    } order by updated_at desc`;
    const result = await this.db.query(sql, params);
    return result.rows.map(mapPosition);
  }

  async findById(id: string): Promise<PositionModel> {
    const result = await this.db.query(
      'select * from positions where id = $1',
      [id],
    );
    const row = result.rows[0];

    if (!row) {
      throw new NotFoundException(`Position ${id} not found`);
    }

    return mapPosition(row);
  }
}
