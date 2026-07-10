/// <reference types="vite/client" />

// Teach TypeScript about CSS Modules
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

// Vite env variables — set in .env (copy from .env.example)
interface ImportMetaEnv {
  readonly VITE_UPI_ID:   string   // e.g. yourname@upi
  readonly VITE_UPI_NAME: string   // e.g. DoctorFormAssist
  readonly VITE_WHATSAPP: string   // e.g. 919812345678 (country code + number)
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
