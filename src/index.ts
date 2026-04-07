import { Obfuscator } from './core/obfuscator';
import { Traverser } from './core/traverser';
import { ObfuscatorConfig } from './config/types';

export function deanonymize(json: any, config: ObfuscatorConfig): any {
  const obfuscator = new Obfuscator(config);
  const traverser = new Traverser(obfuscator);
  return traverser.traverse(json);
}

// Simple CLI test execution when run directly
if (require.main === module) {
  const sampleData = {
    user: {
      id: "u123",
      name: "John Doe",
      email: "john.doe@example.com",
      ssn: "123-45-6789",
      creditCard: "4111222233334444",
      address: "123 Main St",
      preferences: {
        newsletter: true
      }
    },
    orders: [
      { id: "o1", total: 100, email: "john.doe@example.com" }
    ],
    secretToken: "sk_live_123456789",
    internalPhone: "555-1234"
  };

  const config: ObfuscatorConfig = {
    deterministic: true,
    keys: {
      "name": { strategy: "fake", fakeType: "name" }, // Key matching
      "secretToken": { strategy: "hash" },
    },
    // The email, ssn, and creditCard will be caught by built-in regex heuristics.
    // Let's add a custom pattern for phone numbers:
    patterns: {
      "^[0-9]{3}-[0-9]{4}$": { strategy: "redact" } // Custom regex mapped to redact
    }
  };

  console.log("Original JSON:\n", JSON.stringify(sampleData, null, 2));

  const result = deanonymize(sampleData, config);

  console.log("\nObfuscated JSON:\n", JSON.stringify(result, null, 2));
}
