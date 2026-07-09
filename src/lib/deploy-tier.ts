const PROD_IDENTITY_API = "https://api.identity.citronos.com";
const STAGE_IDENTITY_API = "https://stage.api.identity.citronos.com";

const PROD_REDIRECT_ORIGINS = [
  "https://console.citronos.com",
  "https://ermax-bg.com",
];

const STAGE_REDIRECT_ORIGINS = [
  "https://stage.console.citronos.com",
  "https://stage.ermax-bg.com",
  "https://www.stage.ermax-bg.com",
  "http://37.27.204.2:3000",
  "http://37.27.204.2:3100",
];

const STAGE_PORTS = new Set(["3100", "3101", "3104", "8181"]);

export type DeployTier = "prod" | "stage";

export function tierFromHostname(hostname: string, port?: string): DeployTier {
  const host = hostname.toLowerCase();

  if (host === "identity.citronos.com") return "prod";
  if (host === "stage.identity.citronos.com") return "stage";

  if (host === "37.27.204.2" && port && STAGE_PORTS.has(port)) return "stage";
  if (host === "37.27.204.2") return "prod";

  if (host === "localhost" || host === "127.0.0.1") return "stage";

  return "prod";
}

export function resolveIdentityApiUrl(): string {
  if (typeof window === "undefined") {
    return (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(/\/$/, "") ?? PROD_IDENTITY_API;
  }

  const tier = tierFromHostname(window.location.hostname, window.location.port || undefined);
  if (tier === "stage") {
    const fromEnv = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(/\/$/, "");
    if (fromEnv && !fromEnv.includes("api.identity.citronos.com")) return fromEnv;
    return STAGE_IDENTITY_API;
  }

  return PROD_IDENTITY_API;
}

export function allowedRedirectOrigins(): string[] {
  const fromEnv = (import.meta.env.VITE_ALLOWED_REDIRECT_ORIGINS as string | undefined) ?? "";
  const envOrigins = fromEnv
    .split(",")
    .map((o) => o.trim().toLowerCase())
    .filter(Boolean);

  if (typeof window === "undefined") {
    return envOrigins.length ? envOrigins : [...PROD_REDIRECT_ORIGINS, ...STAGE_REDIRECT_ORIGINS];
  }

  const tier = tierFromHostname(window.location.hostname, window.location.port || undefined);
  const defaults = tier === "stage" ? STAGE_REDIRECT_ORIGINS : PROD_REDIRECT_ORIGINS;
  return [...new Set([...defaults, ...envOrigins])];
}
