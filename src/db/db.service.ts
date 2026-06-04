import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);
  private readonly pool =
    env.databaseUrl.length > 0
      ? new Pool({
          connectionString: env.databaseUrl,
          ssl: env.databaseUrl.includes('supabase.co')
            ? { rejectUnauthorized: false }
            : undefined,
        })
      : undefined;

  async onModuleInit() {
    if (!this.pool) {
      this.logger.warn(
        'DATABASE_URL is empty; database-backed endpoints will fail until configured.',
      );
      return;
    }

    await this.query('select 1');
    this.logger.log('PostgreSQL connection ready');
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('DATABASE_URL is not configured');
    }

    return this.pool.query<T>(sql, params);
  }
}
