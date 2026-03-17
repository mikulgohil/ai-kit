# Security Check

Review code for security vulnerabilities — XSS, injection, exposed secrets, and OWASP Top 10 issues.

## What This Command Does

This command scans your code for security problems that could let attackers steal data, inject malicious code, or access unauthorized resources. It focuses on vulnerabilities specific to Next.js, React, and API development.

## How to Use

```
/security-check src/app/api/users/route.ts
```

Or for a broader scan:

```
/security-check src/app/api/
```

## What Gets Checked

### 1. Cross-Site Scripting (XSS)

Look for places where user input is rendered without sanitization.

**Example — Vulnerable:**
```tsx
// dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Unescaped URL parameters in links
<a href={`/search?q=${searchQuery}`}>Search</a>
```

**Example — Safe:**
```tsx
// Use a sanitization library
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />

// Encode URL parameters
<a href={`/search?q=${encodeURIComponent(searchQuery)}`}>Search</a>
```

### 2. Input Validation

Check that all external input (forms, URL params, API bodies) is validated before use.

**Example — Vulnerable:**
```typescript
// API route with no validation
export async function POST(request: Request) {
  const body = await request.json();
  await db.users.create({ data: body }); // Accepts anything!
}
```

**Example — Safe:**
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateUserSchema.parse(body); // Throws if invalid
  await db.users.create({ data: validated });
}
```

### 3. Exposed Secrets

Scan for accidentally committed or leaked credentials.

**Check for:**
- API keys, tokens, or passwords hardcoded in source files
- `.env` files committed to git (should be in `.gitignore`)
- Secrets in client-side code (anything without `NEXT_PUBLIC_` prefix is server-only in Next.js, but verify)
- Secrets logged to console (`console.log(apiKey)`)
- Secrets in error messages sent to clients

**Example — Vulnerable:**
```typescript
const STRIPE_SECRET = 'sk_live_abc123...'; // Hardcoded secret!
```

**Example — Safe:**
```typescript
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY; // Read from env
if (!STRIPE_SECRET) throw new Error('Missing STRIPE_SECRET_KEY'); // Fail loud, don't log the value
```

### 4. Server-Side Request Forgery (SSRF)

Check server actions and API routes that make HTTP requests based on user input.

**Example — Vulnerable:**
```typescript
// User controls the URL — can hit internal services
export async function fetchPreview(url: string) {
  const response = await fetch(url); // Attacker sends: http://169.254.169.254/metadata
  return response.text();
}
```

**Example — Safe:**
```typescript
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

export async function fetchPreview(url: string) {
  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error('URL not allowed');
  }
  const response = await fetch(url);
  return response.text();
}
```

### 5. Authentication & Authorization

- API routes missing auth checks
- Server actions accessible without login
- Role checks missing (e.g., admin-only endpoints accessible by regular users)
- JWT tokens stored in localStorage (vulnerable to XSS — use httpOnly cookies)

### 6. SQL/NoSQL Injection

- Raw database queries with string concatenation
- Unparameterized queries

### 7. Sensitive Data Exposure

- User data (emails, passwords, PII) returned in API responses when not needed
- Verbose error messages in production (stack traces, database errors)
- Missing `Cache-Control` headers on sensitive pages

## Output Format

For each vulnerability found:
1. **Severity** — Critical / High / Medium / Low
2. **What's wrong** — the specific vulnerability
3. **Where** — file path and line number
4. **Attack scenario** — how an attacker would exploit this (explained simply)
5. **Fix** — the exact code change needed
6. **OWASP reference** — which category it falls under

## Quick Reference: Next.js Security Rules

| Rule | Why |
|------|-----|
| Never use `dangerouslySetInnerHTML` with user input | XSS |
| Always validate API route input with Zod or similar | Injection |
| Never hardcode secrets — use `process.env` | Secret exposure |
| Server-only secrets must NOT start with `NEXT_PUBLIC_` | Client leak |
| Use `httpOnly` cookies for auth tokens, not localStorage | XSS token theft |
| Always check authentication in API routes | Unauthorized access |
| Sanitize error messages in production | Info disclosure |

Target: $ARGUMENTS
