# Hillcode · Citron Identity

Vite + React auth portal. See [HILLCODE_UNIVERSAL_GUIDE.md](../../HILLCODE_UNIVERSAL_GUIDE.md).

```bash
npm run hillcode
npm run hillcode -- -c citron --cmd run
npm run hillcode -- -c inkid --cmd web
```

Clients: `citron`, `inkid` — inject writes `.env.local` (`VITE_CLIENT`) and `src/config/client-config.generated.ts`.
