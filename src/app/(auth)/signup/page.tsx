/*"use client"
import { signupAction } from "./actions"

export default function SignupPage() {
  return (
    <form action={signupAction} className="flex flex-col gap-2 w-64">
      <input name="name" placeholder="İsim" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Şifre" required />
      <button type="submit">Kayıt Ol</button>
    </form>
  )
}*/
"use client"

import { useState } from "react"
import { signupAction } from "./actions"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      await signupAction(formData)
      // redirect /signin yapılacak server action içinde
    } catch (err: any) {
      setError(err.message || "Bilinmeyen bir hata oluştu")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
      {error && <p className="text-red-600">{error}</p>}
      <input name="name" placeholder="İsim" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Şifre" required />
      <button type="submit">Kayıt Ol</button>
    </form>
  )
}
