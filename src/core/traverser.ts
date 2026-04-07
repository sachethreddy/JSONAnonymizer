import { Obfuscator } from './obfuscator';

export class Traverser {
  private obfuscator: Obfuscator;

  constructor(obfuscator: Obfuscator) {
    this.obfuscator = obfuscator;
  }

  /**
   * Recursively traverse object and apply obfuscation rules.
   */
  public traverse(target: any, currentKey?: string): any {
    if (target === null || target === undefined) {
      return target;
    }

    if (Array.isArray(target)) {
      return target.map(item => this.traverse(item, currentKey));
    }

    if (typeof target === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(target)) {
        result[key] = this.traverse(value, key);
      }
      return result;
    }

    // It's a primitive value. Let the Obfuscator process it.
    return this.obfuscator.processValue(target, currentKey);
  }
}
