export interface AuditLogOptions {
  userId?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

/**
 * Audit logging is disabled. This is a no-op function.
 */
export async function logAudit(_options: AuditLogOptions) {
  return null;
}

