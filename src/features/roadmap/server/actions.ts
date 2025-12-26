// src/features/roadmap/server/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { generateMockRoadmap } from "./generate";
import { revalidatePath } from "next/cache";

// 1. AI ile Roadmap Oluştur ve Kaydet
export async function createRoadmapWithAI(assignedProjectId: string,path: string ) {
  try {
    // Proje detaylarını çek
    const assignedProject = await prisma.assignedProject.findUnique({
      where: { id: assignedProjectId },
      include: { 
        projectTemplate: true,
        studentProfile: true 
      }
    });

    if (!assignedProject) throw new Error("Proje bulunamadı");

    // Zaten roadmap var mı kontrol et
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { assignedProjectId }
    });

    if (existingRoadmap) throw new Error("Bu proje için zaten bir roadmap var.");

    // AI Mock Servisini Çağır
    const aiSteps = await generateMockRoadmap(
      assignedProject.projectTemplate.title,
      assignedProject.studentProfile.experienceLevel
    );

    // Veritabanına kaydet
    const newRoadmap = await prisma.roadmap.create({
      data: {
        assignedProjectId,
        steps: {
          create: aiSteps.map((step, index) => ({
            title: step.title,
            description: step.description,
            duration: step.duration,
            resources: step.resources,
            order: index + 1
          }))
        }
      }
    });
    
    if (path) {
      revalidatePath(path);
    }
  
    return { success: true, data: newRoadmap };

  } catch (error: any) {
    console.error("Roadmap oluşturma hatası:", error);
    return { error: error.message || "Roadmap oluşturulamadı" };
  }
}



// 1. ADIM GÜNCELLEME (Mentor metni veya süreyi değiştirmek isterse)
export async function updateRoadmapStep(
  stepId: string, 
  data: { title: string; description: string; duration: string },
  path: string
) {
  try {
    await prisma.roadmapStep.update({
      where: { id: stepId },
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration
      }
    });
    revalidatePath(path); // Sayfayı yenile
    return { success: true };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { error: "Güncelleme başarısız." };
  }
}

// 2. ADIM SİLME (Gereksiz adımı kaldırma)
export async function deleteRoadmapStep(stepId: string, path: string) {
  try {
    await prisma.roadmapStep.delete({ where: { id: stepId } });
    revalidatePath(path); // Sayfayı yenile (Listeden hemen silinmesi için)
    return { success: true };
  } catch (error) {
    console.error("Silme hatası:", error);
    return { error: "Silme başarısız" };
  }
}

// 3. ROADMAP ONAYLAMA (Öğrenciye görünür yapma)
export async function approveRoadmap(roadmapId: string, path: string) {
  try {
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { isPublished: true }, // <-- Kritik Nokta: Artık öğrenci görebilir
    });
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error("Onaylama hatası:", error);
    return { error: "Onaylama işlemi başarısız." };
  }
}