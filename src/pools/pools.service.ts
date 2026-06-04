import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { PoolModel } from '../models';
import { mapPool } from '../row-mappers';

@Injectable()
export class PoolsService {
  constructor(private readonly db: DbService) {}

  async findAll(): Promise<PoolModel[]> {
    const result = await this.db.query(
      'select * from pools order by created_at desc',
    );
    return result.rows.map(mapPool);
  }

  async findById(id: string): Promise<PoolModel> {
    const result = await this.db.query('select * from pools where id = $1', [
      id,
    ]);
    const row = result.rows[0];

    if (!row) {
      throw new NotFoundException(`Pool ${id} not found`);
    }

    return mapPool(row);
  }
}
