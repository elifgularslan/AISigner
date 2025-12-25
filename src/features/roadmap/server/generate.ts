// src/features/roadmap/server/generate.ts

export type AIResponseStep = {
  title: string;
  description: string;
  duration: string;
  resources: string[];
};

export async function generateMockRoadmap(
  projectTitle: string,
  experienceLevel: string
): Promise<AIResponseStep[]> {
  // AI gecikmesi simülasyonu (1.5 saniye bekle)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const isWeb = projectTitle.toLowerCase().includes("web") || projectTitle.toLowerCase().includes("site");
  const isMobile = projectTitle.toLowerCase().includes("mobil") || projectTitle.toLowerCase().includes("app");

  const steps: AIResponseStep[] = [
    {
      title: "Proje Analizi ve Gereksinimler",
      description: `${projectTitle} projesi için isterleri belirle, kullanıcı hikayelerini yaz ve teknolojileri seç. (${experienceLevel} seviyesine uygun)`,
      duration: "2 Gün",
      resources: ["https://roadmap.sh", "https://github.com/features/issues"],
    },
    {
      title: "Geliştirme Ortamının Kurulumu",
      description: "VS Code, Git, Node.js kurulumlarını yap ve projeyi init et.",
      duration: "1 Gün",
      resources: ["https://code.visualstudio.com/", "https://git-scm.com/"],
    },
  ];

  if (isWeb) {
    steps.push({
      title: "Frontend Mimarisi (Web)",
      description: "Next.js projesini oluştur, Tailwind CSS kurulumunu yap ve klasör yapısını kur.",
      duration: "1 Hafta",
      resources: ["https://nextjs.org/docs", "https://tailwindcss.com/docs"],
    });
  } else if (isMobile) {
    steps.push({
      title: "Mobil Arayüz Tasarımı",
      description: "React Native veya Flutter ortamını kur, emülatörü hazırla.",
      duration: "1 Hafta",
      resources: ["https://reactnative.dev/", "https://flutter.dev/"],
    });
  } else {
    steps.push({
      title: "Temel Algoritma ve Veri Yapıları",
      description: "Projenin çekirdek mantığını oluşturacak algoritmaları tasarla.",
      duration: "5 Gün",
      resources: ["https://leetcode.com"],
    });
  }

  // Final adımları
  steps.push(
    {
      title: "Kodlama ve Geliştirme",
      description: "Belirlenen özelliklerin kodlanması ve componentlerin oluşturulması.",
      duration: "2 Hafta",
      resources: [],
    },
    {
      title: "Test ve Dokümantasyon",
      description: "Uygulamanın test edilmesi ve README dosyasının hazırlanması.",
      duration: "3 Gün",
      resources: ["https://www.writethedocs.org/"],
    }
  );

  return steps;
}