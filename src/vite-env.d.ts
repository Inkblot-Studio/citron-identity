/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
