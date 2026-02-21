# Backend Integration Guide

This document describes how to replace the mock authentication layer with a real backend API.

## API Contract

### Base URL

Set `VITE_AUTH_API_URL` in your environment (e.g. `https://api.example.com`).

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email/password login |
| POST | `/auth/signup` | User registration |
| POST | `/auth/magic-link` | Send magic link email |
| POST | `/auth/verify-email` | Verify email with token |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/mfa/setup` | Get MFA secret for setup |
| POST | `/auth/mfa/verify` | Verify MFA code |
| GET | `/auth/me` | Validate session |
| GET | `/tenants` | List tenants for user |

---

## Request/Response Schemas

### POST /auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenantId": "acme-corp"
}
```

**Response (success):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "isAuthenticated": true,
    "isEmailVerified": true,
    "twoFactorEnabled": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "tenants": [{"tenantId": "acme-corp", "role": "member"}]
  },
  "requiresMfa": false
}
```

**Response (MFA required):**
```json
{
  "user": { ... },
  "requiresMfa": true
}
```

### POST /auth/signup

**Request:**
```json
{
  "email": "new@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "username": "janedoe",
  "tenantId": "acme-corp"
}
```

**Response:**
```json
{
  "user": { ... },
  "verificationToken": "token_abc123"
}
```

### POST /auth/forgot-password

**Request:**
```json
{
  "email": "user@example.com",
  "tenantId": "acme-corp"
}
```

**Response:** `204 No Content`

### POST /auth/reset-password

**Request:**
```json
{
  "token": "reset_token_abc",
  "newPassword": "newpassword123"
}
```

**Response:** `204 No Content`

### POST /auth/verify-email

**Request:**
```json
{
  "token": "verify_token_abc"
}
```

**Response:** User object

### POST /auth/mfa/setup

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrDataUrl": "data:image/png;base64,..."
}
```

### POST /auth/mfa/verify

**Request:**
```json
{
  "code": "123456"
}
```

**Response:** User object with `isAuthenticated: true`

---

## Token Handling

- **Access token:** Store in `localStorage` or httpOnly cookie
- **Refresh flow:** Implement token refresh before expiry
- **Header:** `Authorization: Bearer <access_token>` for protected endpoints

---

## Tenant Resolution

- Tenant ID is passed in the URL: `/auth/:tenantId/login`
- Include `X-Tenant-Id` header for API requests when tenant context is known
- Backend validates user has access to the tenant

---

## Step-by-Step Integration

1. Create `src/lib/real-auth-api.ts` implementing the `AuthApi` interface from `auth-api.ts`
2. Use `fetch` or axios with `VITE_AUTH_API_URL`
3. Add environment check in `auth-api.ts`:

```ts
const useMock = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';
export const authApi: AuthApi = useMock ? mockAuthApi : realAuthApi;
```

4. Set `VITE_USE_MOCK_AUTH=false` and `VITE_AUTH_API_URL=https://your-api.com` for production

---

## Security Checklist

- [ ] Use HTTPS only
- [ ] Configure CORS appropriately
- [ ] Implement rate limiting on auth endpoints
- [ ] Use secure, httpOnly cookies for tokens (if not localStorage)
- [ ] Validate CSRF tokens for state-changing requests
- [ ] Use generic error messages ("Invalid email or password") to avoid user enumeration
- [ ] Hash passwords with bcrypt/argon2
- [ ] Implement account lockout after failed attempts
