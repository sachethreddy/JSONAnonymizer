import { ObfuscatorConfig, ObfuscationRule } from '../config/types';

const HIGH_RISK_KEYS = ['password', 'apikey', 'token', 'refreshtoken', 'jwt', 'cvv', 'secret'];

const HEURISTIC_PII_KEYS: Record<string, ObfuscationRule> = {
  // Identities
  name: { strategy: 'fake', fakeType: 'name' },
  firstname: { strategy: 'fake', fakeType: 'name' },
  lastname: { strategy: 'fake', fakeType: 'name' },
  fullname: { strategy: 'fake', fakeType: 'name' },
  username: { strategy: 'fake', fakeType: 'name' },

  // Location/Address
  address: { strategy: 'fake', fakeType: 'address' },
  street: { strategy: 'fake', fakeType: 'address' },
  city: { strategy: 'fake', fakeType: 'city' },
  state: { strategy: 'fake', fakeType: 'state' },
  zip: { strategy: 'fake', fakeType: 'zip' },
  zipcode: { strategy: 'fake', fakeType: 'zip' },
  country: { strategy: 'fake', fakeType: 'country' },

  // Personal Info
  dateofbirth: { strategy: 'fake', fakeType: 'date' },
  dob: { strategy: 'fake', fakeType: 'date' },
  phone: { strategy: 'fake', fakeType: 'phone' },
  phonenumber: { strategy: 'fake', fakeType: 'phone' },

  // Identifiers
  id: { strategy: 'tokenize' },
  uuid: { strategy: 'tokenize' },
  userid: { strategy: 'tokenize' },
  customerid: { strategy: 'tokenize' }
};

export class RuleEngine {
  private config: ObfuscatorConfig;

  constructor(config: ObfuscatorConfig) {
    this.config = config;
  }

  /**
   * Determine rule based on exact key match, prioritizing high-risk first, then roles, then generic.
   */
  getRuleForKey(key: string, role?: string): ObfuscationRule | undefined {
    const normalizeKey = key.toLowerCase();

    // 1. High-Risk Enforcer
    // Force redaction regardless of config
    if (HIGH_RISK_KEYS.includes(normalizeKey)) {
      return { strategy: 'redact' };
    }

    // 2. Role-based overrides
    if (role && this.config.roles && this.config.roles[role] && this.config.roles[role].keys) {
       const roleRule = this.config.roles[role].keys![key];
       if (roleRule) return roleRule;
    }

    if (this.config.keys && this.config.keys[key]) {
      return this.config.keys[key];
    }
    
    // 4. Default Heuristic Key Matching
    // If no config assigned, auto-intercept common standard standard PII fields
    if (HEURISTIC_PII_KEYS[normalizeKey]) {
      return HEURISTIC_PII_KEYS[normalizeKey];
    }

    return undefined;
  }
}
