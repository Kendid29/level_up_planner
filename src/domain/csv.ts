// Level Up Planner: CSV Serialization & Formula Injection Prevention
// Strictly handles commas, quotes, newlines, UTF-8, and spreadsheet formula injection

/**
 * Characters that trigger formula execution in spreadsheet applications
 * (Excel, Google Sheets, LibreOffice Calc).
 */
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitizes a string to prevent CSV Formula Injection (CWE-1236).
 * If the value starts with a formula trigger character, prepends a single quote (').
 */
export function sanitizeFormulaInjection(value: string): string {
  if (!value || typeof value !== 'string') return value;
  if (FORMULA_PREFIXES.includes(value[0])) {
    return `'${value}`;
  }
  // Check if string with leading standard spaces starts with formula prefix
  const strippedSpaces = value.replace(/^[ ]+/, '');
  if (strippedSpaces.length > 0 && FORMULA_PREFIXES.includes(strippedSpaces[0])) {
    return `'${value}`;
  }
  return value;
}

/**
 * Escapes an individual field for RFC 4180 compliant CSV output.
 * Handles nulls, numbers, strings with commas, quotes, and newlines.
 */
export function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Apply CSV formula injection protection
  str = sanitizeFormulaInjection(str);

  // If the field contains comma, quote, or newline, wrap in quotes and escape quotes with double quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Serializes an array of objects to a CSV string.
 * Prepends UTF-8 BOM (\uFEFF) so Excel & spreadsheet apps correctly recognize UTF-8 characters.
 */
export function serializeToCSV<T extends Record<string, unknown>>(
  columns: readonly { key: keyof T; header: string }[] | { key: keyof T; header: string }[],
  data: T[]
): string {
  const headerLine = columns.map((col) => escapeCSVField(col.header)).join(',');

  const rowLines = data.map((row) =>
    columns.map((col) => escapeCSVField(row[col.key])).join(',')
  );

  // \uFEFF is the UTF-8 Byte Order Mark (BOM)
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}
