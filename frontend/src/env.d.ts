declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*?base64' {
  const content: string;
  export default content;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

interface ImportMetaHot {
  accept(cb?: (mod: unknown) => void): void;
  accept(deps: string[], cb: (mods: unknown[]) => void): void;
  dispose(cb: (data: Record<string, unknown>) => void): void;
  prune(cb: () => void): void;
  invalidate(): void;
  data: Record<string, unknown>;
}

interface ImportMeta {
  readonly hot?: ImportMetaHot;
  readonly env: Record<string, string | boolean | undefined> & {
    readonly SERVER?: boolean;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly BACKEND_URL?: string;
    readonly BACKEND_URL?: string;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
