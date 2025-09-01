/*
"use server"

import { prisma } from "@/lib/auth/prisma"
import { verify } from "@node-rs/argon2"
import { signinSchema } from "@/features/auth/models/user"
import { signIn } from "next-auth/react"

export async function signinAction(formData: FormData) {
  const parsed = signinSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: { email: ["Kullanici bulunamadi"] } }

  const isValid = await verify(user.password, password)
  if (!isValid) return { error: { password: ["Şifre yanliş"] } }

  await signIn("credentials", { email, password, redirect: true, callbackUrl: "/" })
}
*/
"use server"

import { prisma } from "@/lib/auth/prisma"
import { verify } from "@node-rs/argon2"
import { signinSchema } from "@/features/auth/models/user"
import { signIn } from "next-auth/react"

export async function signinAction(formData: FormData): Promise<void> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const parsed = signinSchema.safeParse({ email, password })
  if (!parsed.success) throw new Error("Form doğrulama hatası")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("Kullanıcı bulunamadı")

  const isValid = await verify(user.password, password)
  if (!isValid) throw new Error("Şifre yanlış")

  // NextAuth credentials ile giriş
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  })

  if (!result?.ok) throw new Error("Giriş yapılamadı")
}
