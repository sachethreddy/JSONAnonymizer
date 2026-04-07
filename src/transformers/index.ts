import { mask } from './mask';
import { redact } from './redact';
import { hash } from './hash';
import { fake } from './fake';
import { tokenize } from './tokenize';
import { ObfuscationStrategy } from '../config/types';

export const transformers = {
  mask,
  redact,
  hash,
  fake,
  tokenize
};

export function applyTransformation(
  strategy: ObfuscationStrategy, 
  value: any, 
  options?: { fakeType?: any; tokenMap?: Map<string, string>; deterministic?: boolean }
): any {
  switch (strategy) {
    case 'mask':
      return mask(value);
    case 'redact':
      return redact(value);
    case 'hash':
      return hash(value);
    case 'fake':
      return fake(options?.fakeType, options?.deterministic ? String(value) : undefined);
    case 'tokenize':
      return tokenize(value, options?.tokenMap || new Map());
    default:
      return value; // no-op fallback
  }
}
