# citron-identity (portal)

Vite + React sign-in portal for the Citron ecosystem ("inkid"). Email-first
auth flow (email → check → password/signup), styled with citron-ds v2.
This is the SSO front door for other Citron apps.

## SSO redirect contract (do not break)

- Arriving with `?redirect_uri=<url>` stores it (sessionStorage) — after login the portal redirects there with the access token in the URL **fragment**: `#token=…`. When the user checked **"Запомни ме на това устройство"**, the fragment also includes `remember=1` (`#token=…&remember=1`) for relying apps to request a longer session at token exchange. Allowed targets: localhost always + `VITE_ALLOWED_REDIRECT_ORIGINS` (comma-separated, baked at build).
- `?prompt=login` = relying app demands a fresh sign-in: the portal logs out its own persisted session and shows the form. Guard in `LoginExperience`: an authenticated user is auto-redirected ONLY if it wasn't a forced login or they just authenticated (`justAuthed` ref) — both login-page effects run in the same React commit, so the stale session is still visible to the redirect effect when the forced logout runs.
- Logic lives in `src/lib/redirect.ts` + `src/components/login/LoginExperience.tsx`. When merging main in, re-verify this flow end-to-end — the main-line portal redesigns have overwritten login UX before.

## Real API vs mocks

`src/lib/auth-api.ts` switches per-method: when `VITE_AUTH_API_URL` is set,
`checkAccount`/`login`/`signup`/`getSession` and MFA (`setupMFA`, `confirmMFA`,
`verifyMFA`, `disableMFA`) hit the real citron-identity-api; magic link, tenant
listing, and username checks are still `src/mocks/`. Unset `VITE_AUTH_API_URL` =
pure-mock UI dev.

## Branches, envs, deployment

- `main` — domain config: `.env.production` → api.identity.citronos.com, redirect origin console.citronos.com
- `stage` — VPS domain config: API `https://stage.api.identity.citronos.com`, redirect origins `stage.console.citronos.com` + `stage.ermax-bg.com` (bare-IP ports :3100/:8181 remain as fallbacks in `deploy-tier.ts`)
- VPS serves the **static dist** (no node at runtime): clone at `/root/inkblot-studio/prod/citron-identity`, built there via one-off `docker run node:20-alpine npm ci && npm run build`, Caddy serves `dist/` at https://stage.identity.citronos.com (prod: https://identity.citronos.com). Deploys/rollbacks via Citron Ops (https://ops.citronos.com) — rollback restores dist **contents in place** (never swap the dir: Caddy's bind mount goes stale → 404s).
- Dev: `npm run dev` on port 3002 (see workspace `.claude/launch.json`); 3000/3001 are taken on this machine.

## Test account

`owner@ermax-bg.com` / `TestPass123!` — registered in both Render staging and the VPS identity DB.
