/**
 * Converts a 0-based column index to spreadsheet A1 column letter (e.g. 0 -> 'A', 26 -> 'AA').
 */
export function columnIndexToLetter(index: number): string {
  let temp = index;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Extracts the sheet name from an A1 range (e.g. "Members!A:D" -> "Members").
 */
export function parseSheetName(range: string): string {
  return range.includes('!') ? range.split('!')[0] : range;
}

/**
 * Builds an A1 notation range for a single row (e.g. "Members!A2:E2").
 */
export function buildRowRange(
  sheet: string,
  rowIndex: number,
  colCount: number,
): string {
  const endCol = columnIndexToLetter(colCount - 1);
  return `${sheet}!A${rowIndex}:${endCol}${rowIndex}`;
}

/**
 * Normalizes spreadsheet headers (e.g. "Full Name", "belt_rank", "ID") to camelCase keys.
 */
export function normalizeHeaderKey(header: string): string {
  if (!header) return '';
  const trimmed = header.trim();
  if (/^[A-Z0-9]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/**
 * Safely converts an unknown cell value to a trimmed string representation.
 */
export function cellToString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return JSON.stringify(val);
}

/**
 * Maps spreadsheet headers to their column indices.
 */
export function mapHeaders(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((header, index) => {
    if (header && typeof header === 'string') {
      const trimmed = header.trim();
      const normalized = normalizeHeaderKey(trimmed);
      map.set(normalized, index);
      map.set(trimmed.toLowerCase(), index);
    }
  });
  return map;
}

/**
 * Converts a row cell array to a typed entity object using header names.
 */
export function rowToEntity<T>(headers: string[], rowValues: unknown[]): T {
  const entity: Record<string, unknown> = {};

  headers.forEach((originalHeader, colIndex) => {
    const normalizedKey = normalizeHeaderKey(originalHeader);
    const val = rowValues[colIndex];
    entity[normalizedKey] = cellToString(val);
  });

  return entity as T;
}

/**
 * Converts an entity object to a row array aligned with the sheet's header positions.
 */
export function entityToRow(
  headers: string[],
  entity: Record<string, unknown>,
): string[] {
  return headers.map((header) => {
    const normalizedKey = normalizeHeaderKey(header);
    const lowerKey = header.trim().toLowerCase();

    const val =
      entity[normalizedKey] ?? entity[header] ?? entity[lowerKey] ?? '';

    return cellToString(val);
  });
}

/**
 * Searches rows for matches using a predicate function, returning entities with 1-based sheet row indexes.
 */
export function findMatchingRows<T>(
  headers: string[],
  dataRows: unknown[][],
  predicate: (row: T) => boolean,
): Array<{ row: T; rowIndex: number }> {
  const results: Array<{ row: T; rowIndex: number }> = [];

  for (let i = 0; i < dataRows.length; i++) {
    const entity = rowToEntity<T>(headers, dataRows[i]);
    if (predicate(entity)) {
      results.push({ row: entity, rowIndex: i + 2 });
    }
  }

  return results;
}

/**
 * Merges existing row values with updates, preserving untouched fields and aligning to headers.
 */
export function prepareMergedRow(
  headers: string[],
  existingRowValues: unknown[],
  updates: Record<string, unknown>,
): string[] {
  const existingEntity = rowToEntity<Record<string, unknown>>(
    headers,
    existingRowValues,
  );
  return entityToRow(headers, { ...existingEntity, ...updates });
}
