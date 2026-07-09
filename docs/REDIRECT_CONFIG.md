# Cross-Domain Redirect Configuration

IS (Identity Service) acts as a central auth provider for all product lines. Users flow:

**Domain A** → **Auth domain** → **Domain A** (or **Domain C**)

## Flow

1. User visits **App A** (e.g. `https://app-a.example.com`)
2. App A redirects to auth:  
   `https://auth.example.com/login?redirect_uri=https://app-a.example.com/callback`
3. User signs in at auth
4. Auth redirects to `https://app-a.example.com/callback` (or Domain C if that was the return target)

## Configuring Your Apps

### 1. Redirect users to auth

When a user needs to log in, redirect them to the auth URL with `redirect_uri`:

```
https://<auth-domain>/login?redirect_uri=<encoded-callback-url>
```

Example (App A):
```
https://auth.yourapp.com/login?redirect_uri=https%3A%2F%2Fapp-a.example.com%2Fcallback
```

### 2. Allowed redirect origins

For security, the auth portal only redirects to **allowed origins**. Configure via env:

```env
VITE_ALLOWED_REDIRECT_ORIGINS=https://app-a.example.com,https://app-c.example.com
```

- **localhost** is always allowed (for dev)
- Production domains must be listed explicitly
- Comma-separated, no spaces

### 3. Callback page in your app

Your app needs a `/callback` (or similar) route that:

1. Receives the user back from auth
2. Reads the access token from the URL **fragment** (`#token=…`)
3. Optionally reads `remember=1` from the same fragment when the user checked "Remember me" on the identity portal — pass `rememberMe: true` to your backend token exchange for a longer refresh session
4. Redirects the user to the intended destination

Auth redirects to the exact `redirect_uri` URL with credentials in the fragment (never query params), e.g. `#token=<jwt>&remember=1`.

## Dashboard (localhost only)

When there is **no** `redirect_uri` in the URL, the auth portal redirects to `/dashboard` after login. Use this for:

- Local development
- Testing the auth flow
- Direct visits to the auth domain

In production, apps should always pass `redirect_uri`, so users never land on the dashboard.

## Example: App integration

```javascript
// In your app (Domain A)
function requireAuth() {
  if (!isLoggedIn()) {
    const callbackUrl = `${window.location.origin}/callback`;
    const authUrl = `https://auth.yourapp.com/login?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    window.location.href = authUrl;
  }
}
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_ALLOWED_REDIRECT_ORIGINS` | Comma-separated list of allowed callback origins (e.g. `https://app.example.com`) |
