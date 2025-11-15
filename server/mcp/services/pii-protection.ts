/**
 * PII Protection and Data Minimization Service
 * 
 * CRITICAL SECURITY NOTICE:
 * This service provides baseline PII protection for the development environment.
 * For production deployment, you MUST implement:
 * 1. Encryption at rest for agent_messages table using PostgreSQL pgcrypto or application-level encryption
 * 2. Encryption in transit via HTTPS/TLS
 * 3. Field-level encryption for sensitive data (symptoms, contact info, diagnosis)
 * 4. Role-based access controls (RBAC) for medical data access
 * 5. Audit logging for all medical data access
 * 6. Data retention policies and automatic purging
 * 7. HIPAA/GDPR compliance measures if applicable
 */

import crypto from "crypto";

export interface PIIProtectionConfig {
  enableRedaction: boolean;
  enableHashing: boolean;
  enableEncryption: boolean;
  encryptionKey?: string;
}

/**
 * PII Protection Service for medical data
 */
export class PIIProtectionService {
  private config: PIIProtectionConfig;
  private encryptionKey: Buffer | null = null;

  constructor(config: PIIProtectionConfig = {
    enableRedaction: true,
    enableHashing: true,
    enableEncryption: false // Disabled by default for dev, MUST enable for production
  }) {
    this.config = config;
    
    // CRITICAL SECURITY CHECK: Require encryption key in production
    if (config.enableEncryption) {
      if (!config.encryptionKey || config.encryptionKey === "dev-key-change-in-production") {
        throw new Error(
          "CRITICAL SECURITY ERROR: Encryption is enabled but no valid ENCRYPTION_KEY environment variable is set. " +
          "Production deployment REQUIRES a secure encryption key from a key management service " +
          "(AWS KMS, Azure Key Vault, HashiCorp Vault). " +
          "Set ENCRYPTION_KEY environment variable or disable encryption for development."
        );
      }
      
      // Derive 32-byte key from provided key
      this.encryptionKey = crypto.scryptSync(config.encryptionKey, 'salt', 32);
      console.log("[PIIProtection] Encryption enabled with managed key");
    } else {
      console.log("[PIIProtection] Running in development mode - encryption disabled, PII redaction enabled");
    }
  }

  /**
   * Minimize PII in medical transcripts
   * Redacts phone numbers, names, and other identifiable information
   */
  minimizePII(text: string): {
    minimized: string;
    redactionCount: number;
  } {
    if (!this.config.enableRedaction) {
      return { minimized: text, redactionCount: 0 };
    }

    let minimized = text;
    let redactionCount = 0;

    // Redact phone numbers (Pakistan formats: +92, 03xx, etc.)
    const phonePattern = /(\+92|0)?[0-9]{10,11}/g;
    const phoneMatches = minimized.match(phonePattern);
    if (phoneMatches) {
      redactionCount += phoneMatches.length;
      minimized = minimized.replace(phonePattern, "[PHONE_REDACTED]");
    }

    // Redact email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = minimized.match(emailPattern);
    if (emailMatches) {
      redactionCount += emailMatches.length;
      minimized = minimized.replace(emailPattern, "[EMAIL_REDACTED]");
    }

    // Redact CNIC numbers (Pakistan National ID: 13 digits)
    const cnicPattern = /\b[0-9]{5}-[0-9]{7}-[0-9]{1}\b/g;
    const cnicMatches = minimized.match(cnicPattern);
    if (cnicMatches) {
      redactionCount += cnicMatches.length;
      minimized = minimized.replace(cnicPattern, "[CNIC_REDACTED]");
    }

    return { minimized, redactionCount };
  }

  /**
   * Hash sensitive data for analytics while preserving privacy
   * Use for aggregating symptoms, conditions without revealing individual identity
   */
  hashSensitiveData(data: string): string {
    if (!this.config.enableHashing) {
      return data;
    }

    return crypto
      .createHash("sha256")
      .update(data)
      .digest("hex")
      .substring(0, 16); // Truncate for brevity
  }

  /**
   * Encrypt sensitive message content
   * WARNING: This is a basic implementation for development.
   * Production MUST use proper key management (AWS KMS, Azure Key Vault, etc.)
   */
  encryptContent(content: string): string {
    if (!this.config.enableEncryption || !this.encryptionKey) {
      return content;
    }

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", this.encryptionKey, iv);
      
      let encrypted = cipher.update(content, "utf8", "hex");
      encrypted += cipher.final("hex");
      
      // Return IV + encrypted data
      return iv.toString("hex") + ":" + encrypted;
    } catch (error) {
      console.error("[PIIProtection] Encryption error:", error);
      return content; // Fallback to plaintext in dev (log error)
    }
  }

  /**
   * Decrypt encrypted message content
   */
  decryptContent(encryptedContent: string): string {
    if (!this.config.enableEncryption || !this.encryptionKey) {
      return encryptedContent;
    }

    try {
      const [ivHex, encrypted] = encryptedContent.split(":");
      if (!ivHex || !encrypted) {
        return encryptedContent; // Not encrypted
      }

      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", this.encryptionKey, iv);
      
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      
      return decrypted;
    } catch (error) {
      console.error("[PIIProtection] Decryption error:", error);
      return encryptedContent; // Return as-is if decryption fails
    }
  }

  /**
   * Process medical transcript before storage
   * Applies PII minimization and optional encryption
   */
  processForStorage(content: string): {
    processed: string;
    metadata: {
      piiRedacted: boolean;
      redactionCount: number;
      encrypted: boolean;
    };
  } {
    // Step 1: Minimize PII
    const { minimized, redactionCount } = this.minimizePII(content);
    
    // Step 2: Encrypt if enabled
    const processed = this.encryptContent(minimized);
    
    return {
      processed,
      metadata: {
        piiRedacted: this.config.enableRedaction,
        redactionCount,
        encrypted: this.config.enableEncryption
      }
    };
  }

  /**
   * Process medical transcript for display
   * Decrypts if needed (but does NOT restore redacted PII)
   */
  processForDisplay(content: string): string {
    return this.decryptContent(content);
  }
}

// Export singleton instance with development defaults
// PRODUCTION: Override this with encryption enabled + proper key management
export const piiProtection = new PIIProtectionService({
  enableRedaction: true, // Always minimize PII
  enableHashing: true, // Enable for analytics
  enableEncryption: process.env.NODE_ENV === "production", // Only encrypt in production
  encryptionKey: process.env.ENCRYPTION_KEY // Will throw if encryption enabled but key missing
});

/**
 * Health check for PII protection service
 * Call this at server startup to fail fast if configuration is invalid
 */
export function validatePIIProtectionConfig(): void {
  if (process.env.NODE_ENV === "production" && !process.env.ENCRYPTION_KEY) {
    throw new Error(
      "CRITICAL SECURITY ERROR: Production deployment requires ENCRYPTION_KEY environment variable. " +
      "Use a key management service (AWS KMS, Azure Key Vault, HashiCorp Vault) to generate and manage encryption keys."
    );
  }
  
  console.log("[PIIProtection] Configuration validated successfully");
}

/**
 * PRODUCTION DEPLOYMENT CHECKLIST:
 * 
 * [ ] Enable encryption: Set ENCRYPTION_KEY environment variable
 * [ ] Use proper key management service (AWS KMS, Azure Key Vault, HashiCorp Vault)
 * [ ] Implement TLS/HTTPS for all API communications
 * [ ] Add role-based access controls for agent_messages table
 * [ ] Implement audit logging for medical data access
 * [ ] Set up data retention policies (auto-delete after N days)
 * [ ] Configure PostgreSQL pgcrypto for database-level encryption
 * [ ] Add authentication/authorization middleware for agent chat API
 * [ ] Implement rate limiting to prevent data scraping
 * [ ] Set up HIPAA/GDPR compliance measures if applicable
 * [ ] Regular security audits and penetration testing
 * [ ] Incident response plan for data breaches
 */
