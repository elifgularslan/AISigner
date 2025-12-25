// src/features/roadmap/server/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { generateMockRoadmap } from "./generate";

// 1. AI ile Roadmap Oluştur ve Kaydet
export async function createRoadmapWithAI(assignedProjectId: string) {
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

    return { success: true, data: newRoadmap };

  } catch (error: any) {
    console.error("Roadmap oluşturma hatası:", error);
    return { error: error.message || "Roadmap oluşturulamadı" };
  }
}

// 2. Roadmap Adımını Sil
export async function deleteRoadmapStep(stepId: string) {
  try {
    await prisma.roadmapStep.delete({ where: { id: stepId } });
    return { success: true };
  } catch (error) {
    return { error: "Silme başarısız" };
  }
}