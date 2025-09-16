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
    const fullData = {
      personal: {
        firstName: getValues("firstName"),
        lastName: getValues("lastName"),
        birthYear: getValues("birthYear"),
        phoneNumber: getValues("phoneNumber"),
      },
      experience: {
        level: getValues("level"),
        interest: getValues("interest"),
      },
      goals: {
        goal: getValues("goal"),
        availability: getValues("availability"),
      },
    }

    try {
      await saveOnboarding(fullData)
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
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Adınız
            </label>
            <Input id="firstName" {...register("firstName")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Soyadınız
            </label>
            <Input id="lastName" {...register("lastName")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700">
              Doğum Yılı
            </label>
            <Input
              id="birthYear"
              type="number"
              {...register("birthYear", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Telefon Numaranız
            </label>
            <Input id="phoneNumber" {...register("phoneNumber")} />
          </div>
        </>
      )}

      {/* Adım 2: Deneyim */}
      {step === 1 && (
        <>
          <div className="space-y-2">
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">
              Seviye
            </label>
            <select {...register("level")} id="level" className="border p-2 rounded w-full">
              <option value="">Seçiniz</option>
              <option value="beginner">Yeni Başlayan</option>
              <option value="intermediate">Orta Seviye</option>
              <option value="advanced">İleri Seviye</option>
            </select>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              İlgi Alanların
            </label>
            <div className="space-y-2">
              {["AI", "Web Development", "Mobile", "Data Science", "UI/UX"].map((interest) => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={interest}
                    {...register("interest")}
                    className="accent-blue-500"
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Adım 3: Hedefler */}
      {step === 2 && (
        <>
          <div className="space-y-2">
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
              Öğrenme hedefiniz nedir?
            </label>
            <Input id="goal" {...register("goal")} />
          </div>

          <div className="space-y-2">
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
              Uygunluk
            </label>
            <select {...register("availability")} id="availability" className="border p-2 rounded w-full">
              <option value="">Uygunluk seçin</option>
              <option value="full-time">Tam zamanlı</option>
              <option value="part-time">Yarı zamanlı</option>
              <option value="weekends">Hafta sonları</option>
            </select>
          </div>
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