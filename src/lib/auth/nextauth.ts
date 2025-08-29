import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/auth/prisma"
//import { compare } from "@node-rs/argon2"
import { verify } from "@node-rs/argon2"; // ✅ doğru fonksiyon


export const authOptions = {
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null

        //const valid = await compare(credentials.password, user.password)
        const isValid = await verify(user.password, credentials.password); // ✅ verify(hash, plain)

      console.log("🔐 hash:", user.password);
      console.log("🔑 plain:", credentials.password);
      console.log("✅ doğrulama sonucu:", isValid);

        return isValid ? user : null
      },
    }),
  ],
}
