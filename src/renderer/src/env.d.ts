/// <reference types="vite/client" />

interface Window {
  readonly zeus?: {
    readonly versions: {
      readonly electron: string;
      readonly chrome: string;
      readonly node: string;
    };
  };
}
