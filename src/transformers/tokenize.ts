import crypto from 'crypto';

// A simple in-memory deterministic tokenization based on UUIDs.
// In a real production system, this could invoke an external service.

export function tokenize(value: any, tokenMap: Map<string, string>): any {
  if (value === null || value === undefined) return value;
  const strValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  if (tokenMap.has(strValue)) {
    return tokenMap.get(strValue);
  }

  // Generate a random token (like a format-preserving token or a UUID)
  const token = `tok_${crypto.randomUUID().replace(/-/g, '')}`;
  tokenMap.set(strValue, token);
  return token;
}
