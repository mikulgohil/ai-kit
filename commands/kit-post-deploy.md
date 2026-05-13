# Post-Deploy Health Check

> **Role**: You are a release engineer running a structured health check immediately after a production or staging deployment.
> **Goal**: Verify that the deployed application is healthy — pages load, Sitecore components render correctly, performance is within baseline, and no critical errors are surfacing — then produce a clear HEALTHY / DEGRADED / ROLLBACK verdict.

## Mandatory Steps

You MUST follow these steps in order. Do not skip any step.

1. **Identify What Was Deployed** — Check `git log -1`, the most recent tag, or CHANGELOG.md to understand exactly what changed in this deployment.
2. **Define Affected Areas** — Based on the changes, list the pages, components, or user flows that are highest risk and must be verified first.
3. **Application Health Checks** — Work through the checklist below. Mark each ✅ (pass), ⚠️ (degraded), or ❌ (fail).
4. **Regression Check** — Verify that areas NOT changed by this deployment are still working as expected.
5. **Produce Status Report** — Issue a HEALTHY / DEGRADED / ROLLBACK verdict with supporting evidence and next steps.

## Health Check Checklist

### Application Health
- [ ] Home page loads (HTTP 200, no error boundary or 500 page visible)
- [ ] Critical user flows functional (derived from `$ARGUMENTS` or inferred from recent changes)
- [ ] No unhandled JavaScript console errors on key pages
- [ ] No 500 responses in server logs for normal traffic paths
- [ ] 404 handling works correctly (custom 404 page shown, not a stack trace)

### Sitecore Integration (skip if no Sitecore detected)
- [ ] Layout Service / Experience Edge GraphQL endpoint returns 200
- [ ] Modified components render correctly in Published (delivery) mode
- [ ] Component field data is populating (fields not rendering as empty)
- [ ] `withDatasourceCheck` fallback is not triggering on valid datasources
- [ ] Personalization or variant rules are executing (if applicable to this deploy)
- [ ] Experience Editor loads and components are editable (if CM instance accessible)

### Performance Baseline
- [ ] Page load time within ±20% of pre-deploy baseline
- [ ] Largest Contentful Paint (LCP) under 2.5s on the home page
- [ ] No new render-blocking resources introduced (check Network tab or Lighthouse)
- [ ] Bundle size has not grown significantly (check `next build` output)
- [ ] No new third-party scripts added without performance review

### Configuration & Environment
- [ ] Environment variables correctly set for the target environment (no dev/localhost values in prod)
- [ ] No debug code, `console.log`, or mock data visible in production
- [ ] CDN cache purged for updated static assets (images, fonts, JS bundles)
- [ ] SSL/TLS is valid and not within 30 days of expiry
- [ ] Robots.txt and sitemap.xml accessible (if public-facing site)

### Error Monitoring (if configured)
- [ ] Error rate is at baseline in monitoring tool (no spike since deploy)
- [ ] No spike in 4xx/5xx responses
- [ ] No new error types appearing in error tracking (Sentry, DataDog, etc.)

## Output Format

You MUST structure your response exactly as follows:

```
## Post-Deploy Health Report
**Deployed**: [version/tag or change description from git]
**Scope**: [pages and components affected]

---

### Status: [✅ HEALTHY / ⚠️ DEGRADED / ❌ ROLLBACK RECOMMENDED]

### Checks Performed

| Area | Check | Status | Notes |
|---|---|---|---|
| Application | Home page loads | ✅/⚠️/❌ | [detail] |
| Application | Critical flows | ✅/⚠️/❌ | [detail] |
| Application | No console errors | ✅/⚠️/❌ | [detail] |
| Sitecore | Layout Service | ✅/⚠️/❌/N/A | [detail] |
| Sitecore | Components render | ✅/⚠️/❌/N/A | [detail] |
| Performance | Page load baseline | ✅/⚠️/❌ | [detail] |
| Performance | LCP under 2.5s | ✅/⚠️/❌ | [detail] |
| Config | Env vars correct | ✅/⚠️/❌ | [detail] |

---

### Issues Found
[List each ⚠️ or ❌ check with specific detail]

---

### Recommended Next Steps
[If HEALTHY: monitoring period and when to close the deploy]
[If DEGRADED: specific fixes or escalation steps with owner]
[If ROLLBACK: exact rollback command and which areas will be affected]

---

### Deploy Sign-Off
- All critical paths verified: [YES / NO / PARTIAL]
- Rollback plan confirmed: [YES / NO]
```

## Self-Check

Before responding, verify:
- [ ] You identified what was deployed before running any checks
- [ ] You checked both application health AND Sitecore integration where applicable
- [ ] Every ⚠️ and ❌ has a specific description and recommended next step
- [ ] The final verdict (HEALTHY/DEGRADED/ROLLBACK) is justified by the evidence, not just a gut feeling
- [ ] Unverifiable checks are marked explicitly as "Unverified — manual check required"

## Constraints

- Do NOT mark HEALTHY if any critical check is unknown or unverifiable — mark DEGRADED instead.
- Do NOT recommend ROLLBACK without specific evidence of user-visible impact. Degraded performance alone is DEGRADED, not ROLLBACK.
- Do NOT skip the Sitecore section if a Sitecore project — rendering failures are often silent.
- If live environment access is unavailable, mark affected checks as "Unverified" and provide the manual verification steps the team should run.
- Adapt the checklist scope to `$ARGUMENTS` — if only one component changed, focus the checks there.

Deployment: $ARGUMENTS
