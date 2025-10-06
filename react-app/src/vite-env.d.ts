/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRIBAL_OPS_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
