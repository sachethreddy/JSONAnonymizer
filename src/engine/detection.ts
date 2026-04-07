import { ObfuscatorConfig, ObfuscationRule } from '../config/types';

export class Detector {
  private config: ObfuscatorConfig;

  // Built-in heuristics rules
  private defaultPatterns: { regex: RegExp, rule: ObfuscationRule }[] = [
    { 
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      rule: { strategy: 'mask' } // email
    },
    {
      regex: /^(?:\d{3}-\d{2}-\d{4}|\d{9})$/, 
      rule: { strategy: 'redact' } // Simple SSN check
    },
    {
       // Basic credit card (e.g. 16 digits)
      regex: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      rule: { strategy: 'mask' } // CC mask
    }
  ];

  private compiledUserPatterns: { regex: RegExp, rule: ObfuscationRule }[] = [];

  constructor(config: ObfuscatorConfig) {
    this.config = config;
    if (this.config.patterns) {
      for (const [patternStr, rule] of Object.entries(this.config.patterns)) {
        this.compiledUserPatterns.push({
          regex: new RegExp(patternStr),
          rule
        });
      }
    }
  }

  /**
   * Determine rule based on regex pattern matching over the string value.
   * User patterns have precedence over built-in patterns.
   */
  getRuleForValue(value: any): ObfuscationRule | undefined {
    if (typeof value !== 'string') return undefined;

    // Check user patterns first
    for (const p of this.compiledUserPatterns) {
      if (p.regex.test(value)) return p.rule;
    }

    // Checking built-in patterns
    for (const p of this.defaultPatterns) {
      if (p.regex.test(value)) return p.rule;
    }

    return undefined;
  }
}
