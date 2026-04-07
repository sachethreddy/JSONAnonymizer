import { ObfuscatorConfig } from '../config/types';
import { RuleEngine } from '../engine/rule-engine';
import { Detector } from '../engine/detection';
import { InlineScanner } from '../engine/inline-scanner';
import { applyTransformation } from '../transformers';
import { logTransformation } from '../utils/logger';

export class Obfuscator {
  private config: ObfuscatorConfig;
  private ruleEngine: RuleEngine;
  private detector: Detector;
  private inlineScanner: InlineScanner;
  private tokenMap: Map<string, string>;
  private currentRole?: string;

  constructor(config: ObfuscatorConfig, role?: string) {
    this.config = config;
    this.ruleEngine = new RuleEngine(config);
    this.detector = new Detector(config);
    this.inlineScanner = new InlineScanner();
    this.tokenMap = new Map<string, string>();
    this.currentRole = role;
  }

  /**
   * Process a single primitive value.
   */
  public processValue(value: any, key?: string): any {
    if (value === null || value === undefined) return value;

    let rule;

    // 1. Exact key match prioritised (includes HighRisk keys which are forced to 'redact')
    if (key) {
      rule = this.ruleEngine.getRuleForKey(key, this.currentRole);
    }

    // 2. Fallback to generic regex heuristics
    if (!rule && typeof value === 'string') {
      rule = this.detector.getRuleForValue(value);
    }

    // 3. Optional Strict Mode inline scanning or Default string cleanup
    let processedValue = value;
    if (typeof processedValue === 'string') {
      // Run the inline scanner to catch PII embedded within strings 
      // (like emails inside a dense log trace)
      // This ensures all free text is scrubbed even if there is an overarching rule
      const original = processedValue;
      processedValue = this.inlineScanner.execute(processedValue);
      if (original !== processedValue) {
        logTransformation(key || 'inline_text', 'inline_masking', processedValue);
      }
    }

    // 4. Apply transformation if a matched explicit/implicit rule is found
    if (rule) {
      logTransformation(key || 'value', rule.strategy, processedValue);
      return applyTransformation(rule.strategy, processedValue, {
        fakeType: rule.fakeType,
        tokenMap: this.tokenMap,
        deterministic: this.config.deterministic
      });
    }

    return processedValue;
  }
}
