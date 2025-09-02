
/*

"use server"

import { prisma } from "@/lib/auth/prisma"
import { hash } from "@node-rs/argon2"
import { signupSchema } from "@/features/auth/models/user"
import { redirect } from "next/navigation"

export async function signupAction(formData: FormData): Promise<void> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const parsed = signupSchema.safeParse({ name, email, password })
  if (!parsed.success) throw new Error("Form doğrulama hatası")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("Bu email zaten kayıtlı")

  const hashedPassword = await hash(password)
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "STUDENT" },
  })

  redirect("/signin")
}
*/
"use server"
import { prisma } from "@/lib/auth/prisma"
import { hash } from "@node-rs/argon2"
import { signupSchema } from "@/features/auth/models/user"
import { redirect } from "next/navigation"

export async function signupAction(
  prevState: any,
  formData: FormData
): Promise<any> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const parsed = signupSchema.safeParse({ name, email, password })

  if (!parsed.success) {
    // Zod hata objesi döndür
    return { error: parsed.error.flatten().fieldErrors }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: { email: ["Bu email zaten kayıtlı"] } }

  const hashedPassword = await hash(password)
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "STUDENT" },
  })

  // Başarılı -> redirect
  redirect("/signin")
}
