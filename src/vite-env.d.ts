/// <reference types="vite/client" />

// Teach TypeScript about CSS Modules
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

// Vite env variables
interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Razorpay Checkout.js loaded from CDN in index.html
interface RazorpayOptions {
  key: string
  amount?: number
  currency?: string
  name?: string
  description?: string
  order_id?: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler?: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open(): void
  close(): void
}

declare class Razorpay {
  constructor(options: RazorpayOptions)
  open(): void
  close(): void
}

interface Window {
  Razorpay: typeof Razorpay
}
