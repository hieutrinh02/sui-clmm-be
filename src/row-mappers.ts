import { PoolModel, PositionModel, SwapModel } from './models';

type DbValue = string | number | boolean | Date | null;
type DbRow = Record<string, DbValue>;

function str(row: DbRow, key: string) {
  const value = row[key];
  return value === null || value === undefined ? '' : String(value);
}

function num(row: DbRow, key: string) {
  return Number(row[key] ?? 0);
}

function bool(row: DbRow, key: string) {
  return Boolean(row[key]);
}

function date(row: DbRow, key: string) {
  const value = row[key];
  return value instanceof Date ? value : new Date(String(value));
}

export function mapPool(row: DbRow): PoolModel {
  return {
    id: str(row, 'id'),
    factoryId: str(row, 'factory_id'),
    typeX: str(row, 'type_x'),
    typeY: str(row, 'type_y'),
    admin: str(row, 'admin'),
    feeBps: str(row, 'fee_bps'),
    tickSpacing: num(row, 'tick_spacing'),
    sqrtPriceX64: str(row, 'sqrt_price_x64'),
    currentTick: num(row, 'current_tick'),
    liquidity: str(row, 'liquidity'),
    createdTxDigest: str(row, 'created_tx_digest'),
    updatedTxDigest: str(row, 'updated_tx_digest'),
    createdAt: date(row, 'created_at'),
    updatedAt: date(row, 'updated_at'),
  };
}

export function mapPosition(row: DbRow): PositionModel {
  return {
    id: str(row, 'id'),
    poolId: str(row, 'pool_id'),
    owner: str(row, 'owner'),
    typeX: str(row, 'type_x'),
    typeY: str(row, 'type_y'),
    tickLower: num(row, 'tick_lower'),
    tickUpper: num(row, 'tick_upper'),
    liquidity: str(row, 'liquidity'),
    amountX: str(row, 'amount_x'),
    amountY: str(row, 'amount_y'),
    createdTxDigest: str(row, 'created_tx_digest'),
    updatedTxDigest: str(row, 'updated_tx_digest'),
    createdAt: date(row, 'created_at'),
    updatedAt: date(row, 'updated_at'),
  };
}

export function mapSwap(row: DbRow): SwapModel {
  return {
    id: str(row, 'id'),
    poolId: str(row, 'pool_id'),
    sender: str(row, 'sender'),
    typeX: str(row, 'type_x'),
    typeY: str(row, 'type_y'),
    zeroForOne: bool(row, 'zero_for_one'),
    amountIn: str(row, 'amount_in'),
    amountOut: str(row, 'amount_out'),
    feeAmount: str(row, 'fee_amount'),
    sqrtPriceX64: str(row, 'sqrt_price_x64'),
    liquidity: str(row, 'liquidity'),
    tick: num(row, 'tick'),
    txDigest: str(row, 'tx_digest'),
    eventSeq: str(row, 'event_seq'),
    timestampMs: str(row, 'timestamp_ms'),
    createdAt: date(row, 'created_at'),
  };
}
