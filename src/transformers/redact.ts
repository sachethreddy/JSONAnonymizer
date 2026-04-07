export function redact(value: any, placeholder: string = '[REDACTED]'): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return placeholder;
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  return placeholder;
}
