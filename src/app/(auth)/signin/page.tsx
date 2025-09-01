"use client"

import { useState } from "react"
import { signinAction } from "./actions"

export default function SigninPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      await signinAction(formData)
      // Giriş başarılı ise redirect yap
      window.location.href = "/" 
    } catch (err: any) {
      setError(err.message || "Bilinmeyen bir hata oluştu")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
      {error && <p className="text-red-600">{error}</p>}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Şifre" required />
      <button type="submit">Giriş Yap</button>
    </form>
  )
}

