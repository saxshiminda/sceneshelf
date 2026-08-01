/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_IMAGE_BASE?: string
  readonly VITE_BACKEND_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
