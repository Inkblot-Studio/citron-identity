/**
 * Active white-label client — set at build time via Vite define (Hillcode inject).
 */
export const CLIENT_ID = import.meta.env.VITE_CLIENT ?? "citron";

export interface ClientConfig {
  id: string;
  displayName: string;
  productName: string;
}

export const CLIENT_CONFIGS: Record<string, ClientConfig> = {
  citron: {
    id: "citron",
    displayName: "Citron",
    productName: "Citron Identity",
  },
  inkid: {
    id: "inkid",
    displayName: "InkID",
    productName: "InkID Auth Portal",
  },
};

export function getClientConfig(id: string = CLIENT_ID): ClientConfig {
  return CLIENT_CONFIGS[id] ?? CLIENT_CONFIGS.citron;
}
