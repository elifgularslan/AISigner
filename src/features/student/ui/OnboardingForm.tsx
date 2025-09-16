"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  personalSchema,
  experienceSchema,
  goalsSchema,
} from "@/features/student/models/onboarding"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { saveOnboarding } from "@/features/student/server/onboarding"

const steps = ["Kişisel Bilgiler", "Deneyim", "Hedefler"]

export default function OnboardingForm() {
  const [step, setStep] = useState(0)

  const schema = [personalSchema, experienceSchema, goalsSchema][step]
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const { register, handleSubmit, formState, getValues } = form

  const onNext = () => {
    if (!formState.isValid) return
    setStep((prev) => prev + 1)
  }

  const onBack = () => setStep((prev) => prev - 1)

  const onFinalSubmit = async () => {
    // tüm veriyi birleştir
    const fullData = {
      personal: {
        firstName: getValues("firstName"),
        lastName: getValues("lastName"),
        birthYear: getValues("birthYear"),
        phoneNumber: getValues("phoneNumber"),
      },
      experience: {
        level: getValues("level"),
        tools: getValues("tools"),
      },
      goals: {
        goal: getValues("goal"),
        availability: getValues("availability"),
      },
    }

    try {
      await saveOnboarding(fullData) // server action çağrısı
    } catch (err) {
      console.error("Onboarding kaydı başarısız:", err)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onFinalSubmit)}
      className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <Progress value={((step + 1) / steps.length) * 100} />

      {/* Adım 1: Kişisel Bilgiler */}
      {step === 0 && (
        <>
          <Input {...register("firstName")} placeholder="Adınız" />
          <Input {...register("lastName")} placeholder="Soyadınız" />
          <Input
            {...register("birthYear", { valueAsNumber: true })}
            placeholder="Doğum Yılı"
            type="number"
          />
          <Input {...register("phoneNumber")} placeholder="Telefon Numaranız" />
        </>
      )}

      {/* Adım 2: Deneyim */}
      {step === 1 && (
        <>
          <select {...register("level")} className="border p-2 rounded w-full">
            <option value="">Seçiniz</option>
            <option value="beginner">Yeni Başlayan</option>
            <option value="intermediate">Orta Seviye</option>
            <option value="advanced">İleri Seviye</option>
          </select>

          <Input
            {...register("tools")}
            placeholder="Kullandığınız araçlar (virgülle ayırın)"
          />
        </>
      )}

      {/* Adım 3: Hedefler */}
      {step === 2 && (
        <>
          <Input {...register("goal")} placeholder="Öğrenme hedefiniz nedir?" />
          <select {...register("availability")} className="border p-2 rounded w-full">
            <option value="">Uygunluk seçin</option>
            <option value="full-time">Tam zamanlı</option>
            <option value="part-time">Yarı zamanlı</option>
            <option value="weekends">Hafta sonları</option>
          </select>
        </>
      )}

      {/* Butonlar */}
      <div className="flex justify-between pt-4">
        {step > 0 && (
          <Button type="button" onClick={onBack}>
            Geri
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button type="button" onClick={onNext} disabled={!formState.isValid}>
            İleri
          </Button>
        ) : (
          <Button type="submit" disabled={!formState.isValid}>
            Gönder
          </Button>
        )}
      </div>
    </form>
  )
}
