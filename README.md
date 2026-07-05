# Citron Identity

Authentication portal for the Citron platform — sign-in, sign-up, password reset, email verification, and MFA.

Built by [Inkblot Studio](https://inkblotstudio.eu).

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18, Vite 4 |
| Language | TypeScript |
| Styling | `@citron-systems/citron-ds` ^2.0.0, SCSS modules |
| Motion | Framer Motion |
| Forms | React Hook Form + Zod |
| State | Zustand |

## Prerequisites

- Node.js **18+**
- npm

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server at `http://localhost:3002` |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript only |

## Environment

Copy `.env.example` to `.env.local` and configure:

| Variable | Purpose |
|----------|---------|
| `VITE_APP_NAME` | Display name |
| `VITE_APP_URL` | Public portal URL |
| `VITE_AUTH_API_URL` | Backend auth API (when not using mocks) |

See `docs/BACKEND_INTEGRATION.md` and `docs/REDIRECT_CONFIG.md` for OAuth redirects and API wiring.

## Auth modes

- **Development:** mock auth in `src/mocks/` when no API URL is configured
- **Production:** point `VITE_AUTH_API_URL` at `citron-identity-api` (or your provider) before go-live

## Project layout

```
src/
├── components/login/   # Primary auth UX (LoginExperience, mascot, shell)
├── components/auth/    # MFA, reset password, loading screen
├── pages/              # Route wrappers
├── store/auth.ts       # Session state
├── lib/auth-api.ts     # API client (mock or live)
└── styles/
    ├── global.css      # citron-ds imports + base
    └── tokens.scss     # Semantic aliases
```

## Deployment

Static SPA on Vercel (or similar). Security headers are defined in `vercel.json`. Do not commit `.env` files or `dist/`.

## Related repos

- `citron-ds` — design tokens
- `citron-crm` / `citron-web` — relying applications

## License

MIT — © Inkblot Studio
