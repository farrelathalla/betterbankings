"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  code: string;
  title: string;
  status: string;
  effectiveDate: string | null;
  sections: Section[];
}

interface Standard {
  id: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
  chapters: Chapter[];
}

export default function AdminStandardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    description: "",
    order: 0,
  });

  // New chapter form
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    code: "",
    title: "",
    effectiveDate: "",
  });
  const [creatingChapter, setCreatingChapter] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStandard();
    }
  }, [user, resolvedParams.id]);

  const fetchStandard = async () => {
    try {
      const res = await fetch(`/api/basel/standards/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setStandard(data.standard);
        setEditForm({
          code: data.standard.code,
          name: data.standard.name,
          description: data.standard.description || "",
          order: data.standard.order || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching standard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStandard = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/basel/standards/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        fetchStandard();
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving standard:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingChapter(true);

    try {
      const res = await fetch("/api/basel/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newChapter,
          standardId: resolvedParams.id,
        }),
      });

      if (res.ok) {
        setNewChapter({ code: "", title: "", effectiveDate: "" });
        setShowNewChapter(false);
        fetchStandard();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create chapter");
      }
    } catch (error) {
      console.error("Error creating chapter:", error);
    } finally {
      setCreatingChapter(false);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (
      !confirm(
        "Delete this chapter and all its content? This cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/basel/chapters/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchStandard();
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 lg:ml-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#355189]" />
        </main>
      </div>
    );
  }

  if (!user || user.role !== "admin" || !standard) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 lg:ml-[280px] p-8">
          <Link
            href="/admin/basel"
            className="text-[#355189] hover:underline flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <p className="text-gray-500">Standard not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar />

      <main className="w-full flex-1 lg:ml-[280px] relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 px-6 lg:px-12 py-8">
          {/* Breadcrumb */}
          <Link
            href="/admin/basel"
            className="inline-flex items-center gap-2 text-[#355189] hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin
          </Link>

          {/* Standard Edit Form */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1B2B4B] to-[#355189] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {standard.code}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#14213D]">
                    Edit Standard
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Manage standard details and chapters
                  </p>
                </div>
              </div>
              <button
                onClick={handleSaveStandard}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#355189] text-white rounded-lg font-semibold hover:bg-[#1B2B4B] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#14213D]">Chapters</h2>
            <button
              onClick={() => setShowNewChapter(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F48C25] text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Chapter
            </button>
          </div>

          {/* New Chapter Form */}
          {showNewChapter && (
            <form
              onSubmit={handleCreateChapter}
              className="bg-white rounded-2xl border border-[#E1E7EF] p-6 mb-4"
            >
              <h3 className="font-bold text-[#14213D] mb-4">New Chapter</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#14213D] mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={newChapter.code}
                    onChange={(e) =>
                      setNewChapter({ ...newChapter, code: e.target.value })
                    }
                    placeholder="10"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Will become {standard.code}
                    {newChapter.code || "XX"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#14213D] mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newChapter.title}
                    onChange={(e) =>
                      setNewChapter({ ...newChapter, title: e.target.value })
                    }
                    placeholder="Introduction"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#14213D] mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={newChapter.effectiveDate}
                    onChange={(e) =>
                      setNewChapter({
                        ...newChapter,
                        effectiveDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creatingChapter}
                  className="px-4 py-2 bg-[#F48C25] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {creatingChapter ? "Creating..." : "Create Chapter"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewChapter(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Chapters List */}
          <div className="space-y-3">
            {standard.chapters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No chapters yet. Create your first one!
                </p>
              </div>
            ) : (
              standard.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-white rounded-2xl border border-[#E1E7EF] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-[#355189]" />
                      <div>
                        <h3 className="font-bold text-[#14213D]">
                          {standard.code}
                          {chapter.code} - {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {chapter.sections.length} sections
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/basel/chapters/${chapter.id}`}
                        className="px-3 py-1.5 text-sm text-[#355189] border border-[#355189] rounded-lg hover:bg-[#355189] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Content
                      </Link>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        disabled={deleting === chapter.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === chapter.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
