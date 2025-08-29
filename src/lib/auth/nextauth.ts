
import type { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials" // NextAuth için Credentials provider (email & password ile giriş)
import { prisma } from "@/lib/auth/prisma" // Prisma Client instance (db erişimi için)
import { verify } from "@node-rs/argon2"; // Şifreleri doğrulamak için argon2 verify metodu
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Prisma ile NextAuth’u bağlayan adapter


// NextAuth konfigürasyonu
export const authOptions : AuthOptions = {
     adapter: PrismaAdapter(prisma),  // Kullanıcı, session, account, verificationToken tablolarını Prisma üzerinden yönetmek için adapter
  session: { strategy: "database"},
// Session stratejisi: "database" seçildi
  // Bu sayede session’lar db’de tutulur, server yeniden başlasa bile session silinmez
  
  secret: process.env.AUTH_SECRET, // Session ve JWT tokenleri imzalamak için kullanılacak secret
  providers: [
    Credentials({
      name: "Credentials", // Login ekranında provider adı
      credentials: {
        email: { label: "Email", type: "text" },// Form input: Email
        password: { label: "Password", type: "password" },// Form input: Password
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null // Eğer kullanıcı email veya password göndermediyse null dön
 
        // DB’den user bul (email ile arama)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        
        // Argon2 ile hash’lenmiş şifreyi kontrol et
                // verify(hash, plainPassword) şeklinde çalışır

        const isValid = await verify(user.password, credentials.password); // ✅ verify(hash, plain)

        return isValid ? user : null
      },
    }),
  ],
   cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,  // JS tarafından erişilemez (XSS koruması)
        sameSite: "lax"as const,  // CSRF koruması için SameSite=Lax
        path: "/", // Her yerde geçerli
        secure: process.env.NODE_ENV === "production", // Prod ortamında HTTPS şart
      },
    },
  },
}
