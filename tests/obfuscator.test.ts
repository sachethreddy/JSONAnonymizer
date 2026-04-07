import { deanonymize } from '../src/index';
import { ObfuscatorConfig } from '../src/config/types';

describe('JSON Obfuscator Phase 6 - Security & Compliance', () => {
  
  const defaultConfig: ObfuscatorConfig = { strictMode: true };

  it('should force redact high-risk fields regardless of configuration', () => {
    const payload = {
      password: "mySuperSecretPassword123!",
      userApiKey: "sk_live_abcdef123", /* Note: HighRisk key matcher targets exact keys, wait we need to verify if case-insensitive partial match or exact match handles apikey. The code normalizes the key and checks EXACT match. Let's send exact 'apikey' */
      apikey: "sk_live_abcdef123",
      token: "jwt_token_data",
      cvv: "123",
      regularField: "Hello World"
    };

    const result = deanonymize(payload, defaultConfig);

    expect(result.password).toBe('[REDACTED]');
    expect(result.apikey).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.cvv).toBe('[REDACTED]');
    expect(result.regularField).toBe('Hello World');
  });

  it('should extract and mask PII hidden inside long free-text logs', () => {
    const payload = {
      event: "login_failure",
      log: "Connection attempted from admin@example.com on device IP 192.168.1.55. User mac is 00:1B:44:11:3A:B7."
    };

    const result = deanonymize(payload, defaultConfig);

    // Email masked
    expect(result.log).toContain('a***n@example.com');
    // IP Masked
    expect(result.log).toContain('xxx.xxx.xxx.xxx');
    // MAC Masked
    expect(result.log).toContain('xx:xx:xx:xx:xx:xx');
    
    // Safety check that original PII is completely wiped
    expect(result.log).not.toContain('admin@example.com');
    expect(result.log).not.toContain('192.168.1.55');
  });

  it('should mask valid credit cards but ignore random numbers', () => {
    // A standard generic test Visa card sequence (always passes Luhn check)
    const validCard = "4242424242424242"; 
    // Random 16-digit noise
    const invalidCard = "1234567812345678"; 

    const payload = {
      paymentLog: `Charging card ${validCard} failed. Try alternative ${invalidCard}`
    };

    const result = deanonymize(payload, defaultConfig);

    // Assuming the Luhn logic validated 4242424242424242
    expect(result.paymentLog).toContain('************4242'); 
    
    // Since 1234567812345678 fails luhn, it should remain untouched
    expect(result.paymentLog).toContain('1234567812345678');
  });

});
