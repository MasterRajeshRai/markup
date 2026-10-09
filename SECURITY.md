# Security Policy & Defense-in-Depth Architecture

Markup CMS is built with enterprise defense-in-depth security principles. No software system is unconditionally "hackproof"; this document outlines the active defensive controls, threat model, cryptographic invariants, and residual operational risks for production deployments.

---

## 1. Threat Model & Defensive Controls

### 1.1 Authentication & Credential Storage
- **Password Hashing:** Uses `PBKDF2-SHA512` with **210,000 iterations** (exceeding OWASP recommended baselines) and 32-byte cryptographic salts.
- **Timing Attack Resistance:** Implements `crypto.timingSafeEqual` across all password and token checks. When an account does not exist, a synthetic dummy password hash calculation runs to ensure constant-time response profiles against user enumeration attacks.
- **Automatic Password Upgrades:** Transparently rehashes legacy or low-iteration passwords upon successful user login.
- **Brute-Force Shield:** Automatic account lockout triggered after repeated failed attempts.
- **Password Reset Tokens:** Single-use, cryptographically signed short tokens hashed at rest with automatic expiration and immediate invalidation upon password mutation.
- **Zero Production Backdoors:** Demo and development bypass paths are strictly locked down when `NODE_ENV === 'production'`.

### 1.2 Two-Factor Authentication (2FA / TOTP)
- **RFC 6238 TOTP:** Compatible with Google Authenticator, 1Password, Authy, Apple Passwords.
- **Envelope Encryption:** TOTP secrets and backup codes are encrypted at rest using **AES-256-GCM** via `SECRET_BOX_KEY`.
- **Clock Drift Mitigation:** Validates tokens with a ±1 step (30s) drift window.
- **Single-Use Emergency Backup Codes:** 8 cryptographically unguessable backup codes generated during enrollment; consumed codes are automatically removed upon use.

### 1.3 Session & Token Management
- **Tokens Hashed at Rest:** Session tokens stored in the database are hashed with `SHA-256`. Even in the event of an unauthorized database snapshot read, session tokens cannot be replayed.
- **Cookie Security:** Cookies are issued as `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
- **Session Revocation:** Active sessions can be audited and terminated remotely via `/admin/security` or API.

### 1.4 API Route Protection & Authorization
- **Unified Route Guard (`guard`):** Enforces mandatory session validation, API key scoping, and RBAC granular permissions (`content.read`, `content.publish`, `settings.manage`, etc.) on all protected endpoints.
- **GraphQL Shield:** Unauthenticated GraphQL queries can only inspect published content. Mutation endpoints and diagnostic metrics strictly require administrative sessions.

### 1.5 Cross-Site Request Forgery (CSRF) & CORS
- **CSRF Defense:** State-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) bearing session cookies must satisfy `Sec-Fetch-Site: same-origin` or match verified origins in `ALLOWED_ORIGINS`.
- **CORS Allowlist:** Dynamic origin matching prevents unauthorized third-party domains from accessing authenticated endpoints with credentials.

### 1.6 Server-Side Request Forgery (SSRF) Guard
- **Outbound Webhooks:** All outbound HTTP requests (webhooks, URL unfurlers) pass through `assertSafeOutboundUrl`:
  - Enforces `http:`/`https:` schemes only (`file:`, `gopher:`, `ftp:` blocked).
  - Validates DNS resolution before sending requests.
  - Blocks private subnets (RFC 1918), loopbacks (`127.0.0.1`, `::1`), link-local addresses, and cloud provider metadata IPs (`169.254.169.254`).

### 1.7 Media & File Upload Hardening
- **Magic-Byte Signature Verification:** Uploaded files undergo binary header inspection (JPG, PNG, WebP, GIF, PDF).
- **Extension Denylist:** Executable and script extensions (`.html`, `.svg`, `.php`, `.js`, `.sh`, `.exe`, `.py`) are rejected.
- **Path Traversal Shield:** Filenames are sanitized with strict character sets; mock R2 endpoints verify directory boundary containment.
- **Sandboxed Content Security Policy:** Media serving endpoints return `Content-Security-Policy: default-src 'none'; sandbox` and `X-Content-Type-Options: nosniff` to eliminate stored XSS risks.

### 1.8 Rate Limiting
- **Edge Sliding Windows:** Multi-tiered rate limiters protect high-risk paths:
  - Login / MFA verify: 10 attempts per 15 minutes.
  - Password recovery: 5 attempts per 15 minutes.
  - Public writes (comments, contact forms, newsletter subscriptions): 20 requests per minute.
  - Public search: 60 queries per minute.

---

## 2. Production Deployment & Operational Checklist

To achieve maximum real-world resilience, production operators should follow these practices:

1. **Edge WAF & DDoS Shield:** Deploy the CMS behind Cloudflare, AWS CloudFront + WAF, or Google Cloud Armor to absorb volumetric layer-3/4 DDoS attacks and malicious bots.
2. **Distributed Rate Limiting:** The default in-memory rate limiter operates per Node/Edge instance. For clustered or serverless deployments across multiple regions, configure a shared Redis or Upstash KV store via `setRateLimitStore`.
3. **Environment Secrets:**
   - Set a strong 32-byte hex key for `SECRET_BOX_KEY`.
   - Set a unique, unguessable `CRON_SECRET` for scheduled task runners.
   - Restrict `ALLOWED_ORIGINS` to trusted frontend websites (e.g. `https://princepublicschool.com`).
4. **Reverse Proxy Trust:** Set `TRUSTED_PROXY="cloudflare"` or `"vercel"` so client IP resolution correctly extracts remote client addresses rather than spoofed `x-forwarded-for` headers.
5. **Periodic Dependency Audits:** Regularly run `pnpm audit` and apply security patches to runtime dependencies.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability within Markup CMS, please report it privately:
- **Email:** security@headless.io
- Please include reproduction steps and environment details. We aim to acknowledge and address reports within 48 hours.
