import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SuiEvent, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { env } from '../config/env';
import { DbService } from '../db/db.service';
import {
  asNumber,
  asString,
  eventStructName,
  parseCoinTypes,
} from './event-utils';

type StoredCursor = {
  txDigest: string;
  eventSeq: string;
};

type CursorRow = {
  cursor_tx_digest: string | null;
  cursor_event_seq: string | null;
};

type PositionLiquidityRow = {
  pool_id: string;
  tick_lower: number;
  tick_upper: number;
  liquidity: string;
  amount_x: string;
  amount_y: string;
  last_modified_tx_digest: string | null;
  last_modified_event_seq: string | null;
};

type PoolLiquidityRow = {
  current_tick: number;
  liquidity: string;
};

const INDEXER_INTERVAL_MS = 5000;
const INDEXER_PAGE_LIMIT = 50;

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private readonly client = new SuiJsonRpcClient({
    url: env.suiRpcUrl,
    network: 'testnet',
  });
  private running = false;

  constructor(private readonly db: DbService) {}

  onModuleInit() {
    if (!env.suiPackageId) {
      this.logger.warn('SUI_PACKAGE_ID is empty; indexer is disabled.');
      return;
    }

    void this.tick();
    setInterval(() => void this.tick(), INDEXER_INTERVAL_MS);
  }

  private async tick() {
    if (this.running) return;
    this.running = true;

    try {
      await this.indexEventsModule();
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.running = false;
    }
  }

  private async indexEventsModule() {
    const syncKey = `sui:${env.suiPackageId}:events`;
    const cursor = await this.getCursor(syncKey);
    const result = await this.client.queryEvents({
      query: {
        MoveEventModule: { package: env.suiPackageId, module: 'events' },
      },
      cursor,
      limit: INDEXER_PAGE_LIMIT,
      order: 'ascending',
    });

    let handled = 0;

    for (const event of result.data) {
      handled += await this.handleEvent(event);
      await this.setCursor(syncKey, event.id);
    }

    this.logger.log(
      `Indexed ${handled}/${result.data.length} events from Sui package events module`,
    );
  }

  private async getCursor(key: string): Promise<StoredCursor | null> {
    const result = await this.db.query<CursorRow>(
      'select cursor_tx_digest, cursor_event_seq from sync_state where id = $1',
      [key],
    );
    const row = result.rows[0];

    if (!row?.cursor_tx_digest || !row?.cursor_event_seq) {
      return null;
    }

    return {
      txDigest: row.cursor_tx_digest,
      eventSeq: row.cursor_event_seq,
    };
  }

  private async setCursor(key: string, cursor: StoredCursor) {
    await this.db.query(
      `
            insert into sync_state (id, cursor_tx_digest, cursor_event_seq, updated_at)
            values ($1, $2, $3, now())
            on conflict (id)
            do update set cursor_tx_digest = excluded.cursor_tx_digest,
                            cursor_event_seq = excluded.cursor_event_seq,
                            updated_at = now()
            `,
      [key, cursor.txDigest, cursor.eventSeq],
    );
  }

  private async handleEvent(event: SuiEvent) {
    const name = eventStructName(event.type);
    const fields = event.parsedJson as Record<string, unknown>;
    const { typeX, typeY } = parseCoinTypes(event.type);

    if (name === 'PoolCreated') {
      await this.upsertPoolCreated(event, fields, typeX, typeY);
      return 1;
    }

    if (name === 'PositionMinted') {
      await this.upsertPositionMinted(event, fields, typeX, typeY);
      return 1;
    }

    if (name === 'PositionModified') {
      await this.applyPositionModified(event, fields);
      return 1;
    }

    if (name === 'Swap') {
      await this.insertSwap(event, fields, typeX, typeY);
      return 1;
    }

    return 0;
  }

  private async upsertPoolCreated(
    event: SuiEvent,
    fields: Record<string, unknown>,
    typeX: string,
    typeY: string,
  ) {
    await this.db.query(
      `
            insert into pools (
                id, factory_id, type_x, type_y, admin, fee_bps, tick_spacing,
                sqrt_price_x64, current_tick, liquidity, created_tx_digest, updated_tx_digest
            )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $10)
      on conflict (id) do nothing
      `,
      [
        asString(fields.pool_id),
        asString(fields.factory_id),
        typeX,
        typeY,
        asString(fields.admin),
        asString(fields.fee_bps),
        asNumber(fields.tick_spacing),
        asString(fields.sqrt_price_x64),
        asNumber(fields.current_tick),
        event.id.txDigest,
      ],
    );
  }

  private async upsertPositionMinted(
    event: SuiEvent,
    fields: Record<string, unknown>,
    typeX: string,
    typeY: string,
  ) {
    const positionId = asString(fields.position_id);
    const poolId = asString(fields.pool_id);
    const tickLower = asNumber(fields.tick_lower);
    const tickUpper = asNumber(fields.tick_upper);
    const liquidity = asString(fields.liquidity);

    const result = await this.db.query<{ id: string }>(
      `
      insert into positions (
        id, pool_id, owner, type_x, type_y, tick_lower, tick_upper,
        liquidity, amount_x, amount_y, created_tx_digest, updated_tx_digest
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      on conflict (id) do nothing
      returning id
      `,
      [
        positionId,
        poolId,
        asString(fields.owner),
        typeX,
        typeY,
        tickLower,
        tickUpper,
        liquidity,
        asString(fields.amount_x),
        asString(fields.amount_y),
        event.id.txDigest,
      ],
    );

    if (result.rows.length > 0) {
      await this.applyPoolLiquidityDelta(
        poolId,
        tickLower,
        tickUpper,
        BigInt(liquidity || '0'),
        false,
      );
    }
  }

  private async applyPositionModified(
    event: SuiEvent,
    fields: Record<string, unknown>,
  ) {
    const positionId = asString(fields.position_id);
    const delta = BigInt(asString(fields.liquidity_delta) || '0');
    const amountX = BigInt(asString(fields.amount_x) || '0');
    const amountY = BigInt(asString(fields.amount_y) || '0');
    const negative = Boolean(fields.liquidity_delta_negative);

    const current = await this.db.query<PositionLiquidityRow>(
      `
      select
        pool_id,
        tick_lower,
        tick_upper,
        liquidity,
        amount_x,
        amount_y,
        last_modified_tx_digest,
        last_modified_event_seq
      from positions
      where id = $1
      `,
      [positionId],
    );
    const row = current.rows[0];

    if (!row) {
      this.logger.warn(
        `PositionModified skipped; position ${positionId} is not indexed yet.`,
      );
      return;
    }

    if (
      row.last_modified_tx_digest === event.id.txDigest &&
      row.last_modified_event_seq === event.id.eventSeq
    ) {
      return;
    }

    const nextLiquidity = negative
      ? BigInt(row.liquidity) - delta
      : BigInt(row.liquidity) + delta;
    const nextAmountX =
      delta === 0n
        ? BigInt(row.amount_x)
        : negative
          ? BigInt(row.amount_x) - amountX
          : BigInt(row.amount_x) + amountX;
    const nextAmountY =
      delta === 0n
        ? BigInt(row.amount_y)
        : negative
          ? BigInt(row.amount_y) - amountY
          : BigInt(row.amount_y) + amountY;

    await this.db.query(
      `
      update positions
      set liquidity = $2,
          amount_x = $3,
          amount_y = $4,
          updated_tx_digest = $5,
          last_modified_tx_digest = $5,
          last_modified_event_seq = $6,
          updated_at = now()
      where id = $1
      `,
      [
        positionId,
        nextLiquidity.toString(),
        nextAmountX.toString(),
        nextAmountY.toString(),
        event.id.txDigest,
        event.id.eventSeq,
      ],
    );

    if (delta > 0n) {
      await this.applyPoolLiquidityDelta(
        row.pool_id,
        row.tick_lower,
        row.tick_upper,
        delta,
        negative,
      );
    }
  }

  private async applyPoolLiquidityDelta(
    poolId: string,
    tickLower: number,
    tickUpper: number,
    delta: bigint,
    negative: boolean,
  ) {
    const result = await this.db.query<PoolLiquidityRow>(
      'select current_tick, liquidity from pools where id = $1',
      [poolId],
    );
    const pool = result.rows[0];

    if (
      !pool ||
      pool.current_tick < tickLower ||
      pool.current_tick >= tickUpper
    ) {
      return;
    }

    const nextLiquidity = negative
      ? BigInt(pool.liquidity) - delta
      : BigInt(pool.liquidity) + delta;

    await this.db.query(
      'update pools set liquidity = $2, updated_at = now() where id = $1',
      [poolId, nextLiquidity.toString()],
    );
  }

  private async insertSwap(
    event: SuiEvent,
    fields: Record<string, unknown>,
    typeX: string,
    typeY: string,
  ) {
    const timestampMs = asString(event.timestampMs ?? Date.now());

    await this.db.query(
      `
      insert into swaps (
        pool_id, sender, type_x, type_y, zero_for_one, amount_in, amount_out,
        fee_amount, sqrt_price_x64, liquidity, tick, tx_digest, event_seq, timestamp_ms
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      on conflict (tx_digest, event_seq) do nothing
      `,
      [
        asString(fields.pool_id),
        asString(fields.sender),
        typeX,
        typeY,
        Boolean(fields.zero_for_one),
        asString(fields.amount_in),
        asString(fields.amount_out),
        asString(fields.fee_amount),
        asString(fields.sqrt_price_x64),
        asString(fields.liquidity),
        asNumber(fields.tick),
        event.id.txDigest,
        event.id.eventSeq,
        timestampMs,
      ],
    );

    await this.db.query(
      `
      update pools
      set sqrt_price_x64 = $2,
          liquidity = $3,
          current_tick = $4,
          updated_tx_digest = $5,
          updated_at = now()
      where id = $1
      `,
      [
        asString(fields.pool_id),
        asString(fields.sqrt_price_x64),
        asString(fields.liquidity),
        asNumber(fields.tick),
        event.id.txDigest,
      ],
    );
  }
}
