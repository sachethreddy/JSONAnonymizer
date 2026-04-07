import crypto from 'crypto';

export function hash(value: any, algorithm: string = 'sha256'): any {
  if (value === null || value === undefined) return value;
  const strValue = typeof value === 'string' ? value : JSON.stringify(value);
  return crypto.createHash(algorithm).update(strValue).digest('hex');
}
