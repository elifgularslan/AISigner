
//AMAç:Bu sayfa, kullanıcıdan alınan kayıt bilgilerini signupAction ile işleyip doğrulama hatalarını göstererek güvenli bir şekilde yeni kullanıcı oluşturmayı amaçlar.

"use client"

import { useActionState } from "react"
import { signupAction } from "./actions"

const initialState = { error: {} as Record<string, string[]> }

export default function SignupPage() {
 
const [state, formAction] = useActionState(signupAction, initialState)


  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Kayıt Ol</h1>

      <form action={formAction} className="flex flex-col gap-4">
        {/* İsim */}
        <div>
          <label className="block">İsim</label>
          <input
            type="text"
            name="name"
            className="border p-2 w-full rounded"
          />
          {state.error?.name && (
            <p className="text-red-500 text-sm">{state.error.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            name="email"
            className="border p-2 w-full rounded"
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
          />
          {state.error?.password && (
            <p className="text-red-500 text-sm">{state.error.password[0]}</p>
          )}
        </div>

        {/* Genel hata */}
        {typeof state.error === "string" && (
          <p className="text-red-500 text-sm">{state.error}</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
  )
}