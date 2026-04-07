// Advanced security formatters and validators

export function luhnCheck(cardNo: string): boolean {
  let s = 0;
  let doubleDigit = false;
  for (let i = cardNo.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNo.charAt(i), 10);
      if (doubleDigit) {
          digit *= 2;
          if (digit > 9) digit -= 9;
      }
      s += digit;
      doubleDigit = !doubleDigit;
  }
  return s % 10 === 0;
}

export function maskCreditCard(cc: string): string {
  // Return last 4 digits unmasked, everything else masked as *
  // Preserving original string length and dashes if they exist
  return cc.replace(/\d(?=\d{4})/g, '*');
}

export function maskEmailInline(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[REDACTED_EMAIL]';
  const maskedLocal = local.length > 2 
    ? `${local[0]}***${local[local.length - 1]}`
    : '***';
  return `${maskedLocal}@${domain}`;
}

export function maskIp(ip: string): string {
  // simple IPv4 mask: 192.168.0.1 -> xxx.xxx.xxx.xxx
  return ip.replace(/\d{1,3}/g, 'xxx');
}

export function maskMac(mac: string): string {
  // 00:1A:2B:3C:4D:5E -> xx:xx:xx:xx:xx:xx
  return mac.replace(/[0-9a-fA-F]{2}/g, 'xx');
}

export function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, '*');
}
