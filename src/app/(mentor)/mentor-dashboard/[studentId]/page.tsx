"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, User, BookOpen, Plus, CheckCircle, AlertCircle, 
  Trash2, Map, Sparkles, Clock 
} from "lucide-react";
import { createRoadmapWithAI } from "@/features/roadmap/server/actions";
import RoadmapApproval from "@/features/roadmap/ui/RoadmapApproval";

// --- TİP TANIMLAMALARI ---
type ProjectTemplate = {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  track: string[];
};

type StudentDetail = {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  studentProfile: {
    id: string;
    birthYear: number | null;
    experienceLevel: string;
    interests: string[];
    goals: string | null;
    availability: string | null;
    assignedProjects: {
      id: string;
      status: string;
      projectTemplate: ProjectTemplate;
      createdAt: string;
      roadmap?: {
        id: string;
        isPublished: boolean;
        steps: {
          id: string;
          title: string;
          description: string | null;
          duration: string;
          order: number;
          resources: string[]; // ✅ Resources eklendi
        }[];
      } | null;
    }[];
  } | null;
};

const statusConfig = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  IN_PROGRESS: { label: "Devam Ediyor", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  COMPLETED: { label: "Tamamlandı", color: "bg-green-100 text-green-800", icon: CheckCircle }
};

const difficultyConfig = {
  EASY: { label: "Kolay", color: "bg-green-100 text-green-800" },
  MEDIUM: { label: "Orta", color: "bg-yellow-100 text-yellow-800" },
  HARD: { label: "Zor", color: "bg-red-100 text-red-800" }
};

export default function StudentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const studentId = params.studentId as string;
  const activeTab = searchParams.get("tab") || "profile";

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [creatingRoadmapId, setCreatingRoadmapId] = useState<string | null>(null);

  // ✅ Sayfa Yenileme Tetikleyicisi
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStudentDetail();
    if (activeTab === "assign") {
      loadProjectTemplates();
      setShowAssignModal(true);
    }
  }, [studentId, activeTab]);

  async function loadStudentDetail() {
    try {
      const res = await fetch(`/api/mentor/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  }

  // Alt bileşenden tetiklenen yenileme fonksiyonu
  const handleRefresh = () => {
    loadStudentDetail();
    setRefreshKey(prev => prev + 1); // Key değişince bileşen sıfırlanır
  };

  async function loadProjectTemplates() {
    try {
      const res = await fetch("/api/admin/project-templates");
      if (res.ok) {
        const data = await res.json();
        setProjectTemplates(data);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  }

  async function assignProject(projectTemplateId: string) {
    if (!student?.studentProfile) return;
    try {
      setAssigningId(projectTemplateId);
      const res = await fetch("/api/mentor/assign-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId: student.studentProfile.id,
          projectTemplateId
        }),
      });

      if (res.ok) {
        await loadStudentDetail();
        closeModal();
        alert("Proje başarıyla atandı!");
      } else {
        alert("Proje atama başarısız");
      }
    } catch (error) {
      alert("Hata oluştu");
    } finally {
      setAssigningId(null);
    }
  }

  async function handleDeleteAssignment(assignedProjectId: string) {
    if (!confirm("Bu proje atamasını kaldırmak istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch("/api/mentor/unassign-project", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedProjectId }),
      });
      if (res.ok) await loadStudentDetail();
      else alert("Silme başarısız.");
    } catch (error) {
      alert("Hata oluştu.");
    }
  }

  async function handleCreateRoadmap(projectId: string) {
    setCreatingRoadmapId(projectId);
    try {
      const result = await createRoadmapWithAI(projectId, pathname);
      if (result.success) {
        handleRefresh(); // Oluşturma sonrası yenile
        alert("Roadmap başarıyla oluşturuldu!");
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Hata oluştu");
    } finally {
      setCreatingRoadmapId(null);
    }
  }

  // ✅ Modal Kapatma: URL'i temizler
  const closeModal = () => {
    setShowAssignModal(false);
    router.replace(pathname); 
  };

  const getStudentName = () => {
    if (!student) return "";
    return [student.name, student.lastName].filter(Boolean).join(" ") || "İsimsiz Öğrenci";
  };

  const getAssignedProjectIds = () => {
    return student?.studentProfile?.assignedProjects?.map(p => p.projectTemplate.id) || [];
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!student) return <div className="p-10 text-center">Öğrenci bulunamadı.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/mentor-dashboard" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getStudentName()}</h1>
          <p className="text-gray-600">{student.email}</p>
        </div>
      </div>

      {!student.studentProfile ? (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
           <p className="text-yellow-800">Profil tamamlanmamış.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil Kartı */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> Profil</h2>
              <p className="text-gray-900 mb-4">Deneyim: {student.studentProfile.experienceLevel}</p>
              <button 
                onClick={() => { loadProjectTemplates(); setShowAssignModal(true); }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex justify-center items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Proje Ata
              </button>
            </div>
          </div>

          {/* Projeler Kartı */}
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Projeler</h2>
              
              {student.studentProfile.assignedProjects.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Proje atanmamış.</p>
              ) : (
                <div className="space-y-6">
                  {student.studentProfile.assignedProjects.map(project => {
                    const statusInfo = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.PENDING;
                    return (
                      <div key={project.id} className="border rounded-lg p-4 relative group">
                        <button onClick={() => handleDeleteAssignment(project.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h3 className="font-medium text-gray-900">{project.projectTemplate.title}</h3>
                        <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full mt-1 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">{project.projectTemplate.description}</p>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold flex items-center text-gray-900">
                              <Map className="w-4 h-4 mr-2 text-purple-600" /> Yol Haritası
                            </h4>
                            {!project.roadmap && (
                              <button 
                                onClick={() => handleCreateRoadmap(project.id)}
                                disabled={creatingRoadmapId === project.id}
                                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-700 flex items-center"
                              >
                                {creatingRoadmapId === project.id ? "Oluşturuluyor..." : <><Sparkles className="w-3 h-3 mr-1" /> AI ile Oluştur</>}
                              </button>
                            )}
                          </div>
                          
                          {/* ✅ ROADMAP APPROVAL (Refresh Logic Eklendi) */}
                          {project.roadmap && (
                            <RoadmapApproval 
                              key={refreshKey} // <-- Bileşeni sıfırlar
                              roadmapId={project.roadmap.id}
                              steps={project.roadmap.steps}
                              isPublished={project.roadmap.isPublished}
                              studentName={getStudentName()}
                              path={pathname}
                              onRefresh={handleRefresh} // <-- Geri arama fonksiyonu
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal Düzeltildi: Siyah ekran yok, URL temizleniyor */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Proje Ata - {getStudentName()}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            </div>
            <div className="p-6 grid gap-4 md:grid-cols-2">
               {projectTemplates.map(template => {
                 const isAssigned = getAssignedProjectIds().includes(template.id);
                 return (
                   <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                     <h3 className="font-medium">{template.title}</h3>
                     <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                     <button
                        onClick={() => assignProject(template.id)}
                        disabled={isAssigned || assigningId !== null}
                        className={`w-full py-2 rounded text-sm text-white ${isAssigned ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'}`}
                     >
                        {isAssigned ? 'Atanmış' : 'Ata'}
                     </button>
                   </div>
                 )
               })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}