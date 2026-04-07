import { maskEmailInline, maskCreditCard, maskIp, maskMac, maskPhone, luhnCheck } from '../transformers/security';

// Global matchers for embedded strings
const PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Simplistic CC matching 13-19 digits with optional separators
  CREDIT_CARD: /\b(?:\d[ -]*?){13,19}\b/g,
  IP_V4: /\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  MAC: /\b([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})\b/g,
  // Generic Phone: (123) 456-7890 or 123-456-7890
  PHONE: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
};

export class InlineScanner {
  /**
   * Scans a string and replaces known PII/financial patterns inline.
   */
  public execute(text: string): string {
    if (typeof text !== 'string') return text;

    let result = text;

    result = result.replace(PATTERNS.CREDIT_CARD, (match) => {
      const numericString = match.replace(/[\s-]/g, '');
      if (luhnCheck(numericString) && numericString.length >= 13) {
        return maskCreditCard(match);
      }
      return match;
    });

    result = result.replace(PATTERNS.EMAIL, (match) => maskEmailInline(match));
    result = result.replace(PATTERNS.IP_V4, (match) => maskIp(match));
    result = result.replace(PATTERNS.MAC, (match) => maskMac(match));
    result = result.replace(PATTERNS.PHONE, (match) => maskPhone(match));

    return result;
  }
}
