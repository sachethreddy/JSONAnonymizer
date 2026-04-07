export type ObfuscationStrategy = 
  | 'mask'
  | 'redact'
  | 'hash'
  | 'fake'
  | 'tokenize';

export interface TransformerContext {
  key?: string;
  value: any;
  strategy: ObfuscationStrategy;
  fakeType?: 'name' | 'email' | 'phone' | 'address' | 'creditCard' | 'uuid' | 'city' | 'state' | 'zip' | 'country' | 'date';
  // Additional configuration for tokenization if needed
  tokenMap?: Map<string, string>;
}

export type ObfuscationRule = {
  strategy: ObfuscationStrategy;
  fakeType?: TransformerContext['fakeType'];
};

export interface ObfuscatorConfig {
  keys?: Record<string, ObfuscationRule>;   // Exact key matching
  patterns?: Record<string, ObfuscationRule>; // Regex pattern matching for values
  deterministic?: boolean; // If true, masking/faking should be consistent for same values
  strictMode?: boolean; // Enforce aggressive string scanning & redaction
  roles?: Record<string, {
    keys?: Record<string, ObfuscationRule>;
    patterns?: Record<string, ObfuscationRule>;
  }>;
}
