import {z} from "zod";

export const personalSchema = z.object({
    firstName: z.string().min(2, "İsim en az 2 karakterli olmalı"),
    lastName: z.string().min(2, "Soyisim en az 2 karakterli olmalı"),
    
    birthYear: z.number().refine(val => val >= 1950 && val <= new Date().getFullYear(), {
  message: "1950 ile mevcut yıl arasında bir değer girin"
}),
    phoneNumber: z
  .string()
  .min(10, "Telefon numarası gerekli")
  .regex(/^\+?\d{10,15}$/, "Telefon numarası geçerli formatta olmalı"),

   
});


    export const experienceSchema = z.object({
 level: z.enum(["beginner", "intermediate", "advanced"]),
  tools: z.preprocess(
  (val) => (typeof val === "string" ? val.split(",").map((t) => t.trim()) : []),
  z.array(z.string().min(1)).min(1, "En az bir araç belirtin")
),



})

export const goalsSchema = z.object({
  goal: z.string().min(10, "Hedefinizi biraz daha detaylandırın"),
  availability: z.enum(["full-time", "part-time", "weekends"])
  .refine((val) => !!val, {
    message: "Uygunluk seçilmelidir",
  }),
})
