export type EventTypeName =
  | 'PoolCreated'
  | 'PositionMinted'
  | 'PositionModified'
  | 'Swap';

export function eventStructName(type: string): EventTypeName | undefined {
  const match = type.match(/::events::([A-Za-z0-9_]+)/);
  const name = match?.[1];

  if (
    name === 'PoolCreated' ||
    name === 'PositionMinted' ||
    name === 'PositionModified' ||
    name === 'Swap'
  ) {
    return name;
  }

  return undefined;
}

export function parseCoinTypes(type: string) {
  const start = type.indexOf('<');
  const end = type.lastIndexOf('>');

  if (start === -1 || end === -1 || end <= start) {
    return { typeX: '', typeY: '' };
  }

  const generic = type.slice(start + 1, end);
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of generic) {
    if (char === '<') depth += 1;
    if (char === '>') depth -= 1;

    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim().length > 0) {
    parts.push(current.trim());
  }

  return {
    typeX: parts[0] ?? '',
    typeY: parts[1] ?? '',
  };
}

export function asString(value: unknown) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return value.toString();
  }
  return '';
}

export function asNumber(value: unknown) {
  return Number(value ?? 0);
}
