/// <reference types="vite/client" />

// Teach TypeScript about CSS Modules
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
