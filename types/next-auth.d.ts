// 🔧 Bu dosya, NextAuth'un varsayılan tiplerini genişletmek için kullanılır.
// Amaç: session, JWT ve user objelerine özel alanlar ekleyerek TypeScript desteğini tam hale getirmek.

import NextAuth from "next-auth"

declare module "next-auth" {
  
  interface Session {
    sessionToken?: string
    user: {
      name?: string
      email?: string
      role?: string
    }
  }

  interface JWT {
    sessionToken?: string
    role?: string
  }

  interface User {
    role?: string
  }
}
