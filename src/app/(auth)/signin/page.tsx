
//AMAÇ:Kullanıcının giriş bilgilerini doğrulayıp NextAuth üzerinden oturum başlatmak ve hataları kullanıcıya göstermek için hazırlanmış client-side form bileşenidir.
"use client"

import { useState } from "react"
import { validateUser } from "./actions"
import { signIn } from "next-auth/react"

const initialState = { error: {} as Record<string, string[]> }

export default function SigninPage() {
  const [state, setState] = useState(initialState)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState(initialState) // önce hataları sıfırla

    const formData = new FormData(e.currentTarget)

    try {
      const res = await validateUser(formData)
      if (res?.error) {
        setState({ error: res.error })
        return
      }

      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false
      })

      if (result?.ok) window.location.href = "/"
      else setState({ error: { general: ["Giriş yapılamadı"] } })
    } catch (err: any) {
      setState({ error: { general: [err.message || "Bilinmeyen bir hata oluştu"] } })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Giriş Yap</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            name="email"
            className="border p-2 w-full rounded"
            required
          />
          {state.error?.email && (
            <p className="text-red-500 text-sm">{state.error.email[0]}</p>
          )}
        </div>

        {/* Şifre */}
        <div>
          <label className="block">Şifre</label>
          <input
            type="password"
            name="password"
            className="border p-2 w-full rounded"
            required
          />
          {state.error?.password && (
            <p className="text-red-500 text-sm">{state.error.password[0]}</p>
          )}
        </div>

        {/* Genel hata */}
        {state.error?.general && (
          <p className="text-red-500 text-sm">{state.error.general[0]}</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  )
}


// STİLSİZ HALİ //
/*
"use client"
import { useState } from "react"
import { validateUser } from "./actions"
import { signIn } from "next-auth/react"

export default function SigninPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    try {
      const res = await validateUser(formData)
      if (res?.error) {
        setError(Object.values(res.error).flat().join(", "))
        return
      }

      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false
      })

      if (result?.ok) window.location.href = "/"
      else setError("Giriş yapılamadı")
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
*/