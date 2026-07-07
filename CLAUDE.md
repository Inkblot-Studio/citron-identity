# citron-identity (portal)

Vite + React sign-in portal for the Citron ecosystem ("inkid"). Email-first
auth flow (email → check → password/signup), styled with citron-ds v2.
This is the SSO front door for other Citron apps.

## Real API vs mocks

`src/lib/auth-api.ts` switches per-method: when `VITE_AUTH_API_URL` is set,
`checkAccount`/`login`/`signup` hit the real citron-identity-api; everything
else (magic link, MFA setup, MFA verify-by-userId, tenants, username checks)
is still `src/mocks/`. **Consequence:** an account with TOTP enabled cannot
complete login through the portal — real MFA uses `mfaTicket`, the portal's
MFA step still calls the mock. Unset `VITE_AUTH_API_URL` = pure-mock UI dev.

## SSO redirect contract (do not break)

- Arriving with `?redirect_uri=<url>` stores it (sessionStorage) — after login the portal redirects there with the access token in the URL **fragment**: `#token=…`. Allowed targets: localhost always + `VITE_ALLOWED_REDIRECT_ORIGINS` (comma-separated, baked at build).
- `?prompt=login` = relying app demands a fresh sign-in: the portal logs out its own persisted session and shows the form. Guard in `LoginExperience`: an authenticated user is auto-redirected ONLY if it wasn't a forced login or they just authenticated (`justAuthed` ref) — both login-page effects run in the same React commit, so the stale session is still visible to the redirect effect when the forced logout runs.
- Logic lives in `src/lib/redirect.ts` + `src/components/login/LoginExperience.tsx`. When merging main in, re-verify this flow end-to-end — the main-line portal redesigns have overwritten login UX before.

## Branches, envs, deployment

- `main` — domain config: `.env.production` → api.identity.citronos.com, redirect origin console.citronos.com
- `stage` — bare-IP VPS config: API `http://23.88.36.188:8080`, redirect origin `http://23.88.36.188:3000`
- VPS serves the **static dist** (no node at runtime): clone at `/root/inkblot-studio/prod/citron-identity`, built there via one-off `docker run node:20-alpine npm ci && npm run build`, Caddy serves `dist/` on :8081 (and identity.citronos.com once DNS lands). Deploys/rollbacks via Citron Ops (:9090) — rollback restores dist **contents in place** (never swap the dir: Caddy's bind mount goes stale → 404s).
- Dev: `npm run dev` on port 3002 (see workspace `.claude/launch.json`); 3000/3001 are taken on this machine.

## Test account

`owner@ermax-bg.com` / `TestPass123!` — registered in both Render staging and the VPS identity DB.
