import winston from 'winston';

// Configure basic Winston logger
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'json-obfuscator' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

export function logTransformation(path: string, strategy: string, original?: any, ruleset?: string) {
  auditLogger.info('Transformation applied', {
    path,
    strategy,
    ruleset,
    // Note: Logging original value could leak data if strict compliance is required.
    // For this prototype, we'll log it if the environment isn't strictly locked down.
    originalPreview: original ? String(original).substring(0, 4) + '...' : undefined
  });
}
