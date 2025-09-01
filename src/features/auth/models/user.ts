import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmali"),
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmali"),
})

export const signinSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmali"),
})
