"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Edit2, Save, Trash2, X, Link as LinkIcon } from "lucide-react";
import { approveRoadmap, deleteRoadmapStep, updateRoadmapStep } from "../server/actions";

// ✅ Resources (Linkler) alanı eklendi
type Step = {
  id: string;
  title: string;
  description: string | null;
  duration: string;
  order: number;
  resources: string[]; 
};

type RoadmapApprovalProps = {
  roadmapId: string;
  steps: Step[];
  isPublished: boolean;
  studentName: string;
  path: string;
  onRefresh: () => void; // ✅ Üst bileşeni yenilemek için tetikleyici
};

export default function RoadmapApproval({ roadmapId, steps, isPublished, studentName, path, onRefresh }: RoadmapApprovalProps) {
  const router = useRouter();

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", duration: "" });

  const handleEditClick = (step: Step) => {
    setEditingStepId(step.id);
    setEditForm({
      title: step.title,
      description: step.description || "",
      duration: step.duration
    });
  };

  const handleSaveStep = async (stepId: string) => {
    await updateRoadmapStep(stepId, editForm, path);
    setEditingStepId(null);
    router.refresh(); 
    onRefresh(); // ✅ Listeyi anında yenilet
  };

  const handleDeleteStep = async (stepId: string) => {
    if (confirm("Bu adımı silmek istediğinize emin misiniz?")) {
      await deleteRoadmapStep(stepId, path);
      router.refresh();
      onRefresh(); // ✅ Listeyi anında yenilet
    }
  };

  const handleApprove = async () => {
    if (!confirm(`Bu yol haritasını onaylayıp ${studentName} adlı öğrenciye atamak istiyor musunuz?`)) return;
    setLoading(true);
    const res = await approveRoadmap(roadmapId, path);
    if (res.success) {
      router.refresh();
      onRefresh(); // ✅ Durumu anında yenilet
    } else {
      alert("Hata oluştu");
    }
    setLoading(false);
  };

  // Adımları sırala
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Roadmap Taslağı</h3>
          <p className="text-sm text-gray-500 mt-1">
            {isPublished 
              ? "✅ Bu roadmap onaylandı ve öğrenciye atandı." 
              : "⚠️ Bu taslak henüz öğrenci tarafından görünmüyor. Düzenleyip onaylayın."}
          </p>
        </div>
        {!isPublished && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {loading ? "İşleniyor..." : "Onayla ve Ata"}
          </button>
        )}
      </div>

      {/* Adımlar Listesi */}
      <div className="space-y-4">
        {sortedSteps.map((step, index) => (
          <div key={step.id} className={`p-4 rounded-lg border transition-colors ${editingStepId === step.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
            
            {editingStepId === step.id ? (
              // --- DÜZENLEME MODU ---
              <div className="space-y-3">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2 border rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Başlık"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Açıklama"
                  rows={2}
                />
                <input
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Süre (örn: 1 Hafta)"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingStepId(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded"><X className="w-4 h-4" /></button>
                  <button onClick={() => handleSaveStep(step.id)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Save className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              // --- GÖRÜNTÜLEME MODU ---
              <div className="relative group">
                {!isPublished && (
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded shadow-sm border">
                    <button onClick={() => handleEditClick(step)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteStep(step.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-1 pr-16">
                  <span className="bg-white border text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">{index + 1}</span>
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {step.duration}
                  </span>
                </div>
                <p className="text-sm text-gray-600 pl-9 leading-relaxed">{step.description}</p>
                
                {/* ✅ Linkler (Resources) burada listeleniyor */}
                {step.resources && step.resources.length > 0 && (
                  <div className="pl-9 mt-2 flex flex-wrap gap-2">
                    {step.resources.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline bg-blue-50 border border-blue-100 px-2 py-1 rounded flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" /> Kaynak {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}