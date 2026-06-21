import { prisma } from './prisma';

export interface AuditLogOptions {
  userId?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Creates an audit log in the database.
 * Sanitizes metadata to prevent accidental storage of secrets/tokens.
 */
export async function logAudit({
  userId,
  action,
  ipAddress,
  userAgent,
  metadata,
}: AuditLogOptions) {
  try {
    const sanitizedMetadata: Record<string, any> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        const lowKey = key.toLowerCase();
        if (
          lowKey.includes('token') ||
          lowKey.includes('secret') ||
          lowKey.includes('password') ||
          lowKey.includes('key') ||
          lowKey.includes('auth') ||
          lowKey.includes('credential')
        ) {
          sanitizedMetadata[key] = '[REDACTED]';
        } else {
          sanitizedMetadata[key] = value;
        }
      }
    }

    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: Object.keys(sanitizedMetadata).length > 0 ? sanitizedMetadata : undefined,
      },
    });
  } catch (error) {
    // Fail-safe: log DB audit insertion failure to console so that it doesn't block critical logic (e.g. login/checkout)
    console.error('❌ DB Audit Logger Failure:', error);
  }
}
