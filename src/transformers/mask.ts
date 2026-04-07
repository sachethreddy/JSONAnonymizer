export function mask(value: any): any {
  if (typeof value !== 'string') return value;
  
  if (value.includes('@')) {
    // Mask email
    const [local, domain] = value.split('@');
    if (!local || !domain) return '*'.repeat(value.length);
    const maskedLocal = local.length > 2 
      ? `${local[0]}***${local[local.length - 1]}`
      : '***';
    return `${maskedLocal}@${domain}`;
  }

  // Generic string masking: keep first and last char, mask rest.
  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }
  
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`;
}
