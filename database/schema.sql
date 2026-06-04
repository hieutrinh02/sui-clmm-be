create table if not exists pools (
  id text primary key,
  factory_id text not null,
  type_x text not null,
  type_y text not null,
  admin text not null,
  fee_bps numeric not null,
  tick_spacing integer not null,
  sqrt_price_x64 numeric not null,
  current_tick integer not null,
  liquidity numeric not null default 0,
  created_tx_digest text not null,
  updated_tx_digest text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists positions (
  id text primary key,
  pool_id text not null references pools(id) on delete cascade,
  owner text not null,
  type_x text not null,
  type_y text not null,
  tick_lower integer not null,
  tick_upper integer not null,
  liquidity numeric not null default 0,
  amount_x numeric not null default 0,
  amount_y numeric not null default 0,
  last_modified_tx_digest text,
  last_modified_event_seq text,
  created_tx_digest text not null,
  updated_tx_digest text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists swaps (
  id bigserial primary key,
  pool_id text not null references pools(id) on delete cascade,
  sender text not null,
  type_x text not null,
  type_y text not null,
  zero_for_one boolean not null,
  amount_in numeric not null,
  amount_out numeric not null,
  fee_amount numeric not null,
  sqrt_price_x64 numeric not null,
  liquidity numeric not null,
  tick integer not null,
  tx_digest text not null,
  event_seq text not null,
  timestamp_ms numeric not null,
  created_at timestamptz not null default now(),
  unique (tx_digest, event_seq)
);

create table if not exists sync_state (
  id text primary key,
  cursor_tx_digest text,
  cursor_event_seq text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_positions_owner on positions(owner);
create index if not exists idx_positions_pool_id on positions(pool_id);
create index if not exists idx_swaps_pool_id on swaps(pool_id);
create index if not exists idx_swaps_sender on swaps(sender);
create index if not exists idx_swaps_timestamp_ms on swaps(timestamp_ms desc);
