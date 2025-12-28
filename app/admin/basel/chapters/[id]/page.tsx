"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Save,
  BookOpen,
  HelpCircle,
  GripVertical,
  X,
} from "lucide-react";

// Dynamically import SubsectionEditor to avoid SSR issues with TipTap
const SubsectionEditor = dynamic(
  () => import("@/components/editor/SubsectionEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center h-[150px]">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    ),
  }
);

// Dynamically import NewSubsectionEditor for creating new subsections
const NewSubsectionEditor = dynamic(
  () =>
    import("@/components/editor/SubsectionEditor").then((mod) => ({
      default: mod.NewSubsectionEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center h-[200px]">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    ),
  }
);

// Dynamically import RichContentRenderer for displaying content
const RichContentRenderer = dynamic(
  () => import("@/components/editor/RichContentRenderer"),
  {
    ssr: false,
    loading: () => <span className="text-gray-400">Loading...</span>,
  }
);

interface Footnote {
  id: string;
  number: number;
  content: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface Subsection {
  id: string;
  number: string;
  content: string;
  order: number;
  footnotes: Footnote[];
  faqs: FAQ[];
}

interface Section {
  id: string;
  title: string;
  order: number;
  subsections: Subsection[];
}

interface Chapter {
  id: string;
  code: string;
  title: string;
  status: string;
  effectiveDate: string | null;
  standard: {
    id: string;
    code: string;
    name: string;
  };
  sections: Section[];
}

export default function AdminChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(
    new Set()
  );

  // Edit chapter form
  const [chapterForm, setChapterForm] = useState({
    title: "",
    code: "",
    effectiveDate: "",
    status: "current",
  });

  // New section form
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSection, setNewSection] = useState({ title: "" });

  // New subsection state
  const [newSubsectionFor, setNewSubsectionFor] = useState<string | null>(null);
  const [newSubsection, setNewSubsection] = useState({
    number: "",
    content: "",
  });

  // Edit states
  const [editingSubsection, setEditingSubsection] = useState<string | null>(
    null
  );
  const [subsectionContent, setSubsectionContent] = useState("");

  // Footnote/FAQ forms
  const [addingFootnote, setAddingFootnote] = useState<string | null>(null);
  const [newFootnote, setNewFootnote] = useState({ number: 1, content: "" });
  const [addingFAQ, setAddingFAQ] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchChapter();
    }
  }, [user, resolvedParams.id]);

  const fetchChapter = async () => {
    try {
      const res = await fetch(`/api/basel/chapters/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setChapter(data.chapter);
        setChapterForm({
          title: data.chapter.title,
          code: data.chapter.code,
          effectiveDate: data.chapter.effectiveDate?.split("T")[0] || "",
          status: data.chapter.status,
        });
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChapter = async () => {
    setSaving(true);
    try {
      await fetch(`/api/basel/chapters/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chapterForm),
      });
      fetchChapter();
    } catch (error) {
      console.error("Error saving chapter:", error);
    } finally {
      setSaving(false);
    }
  };

  // Section CRUD
  const handleCreateSection = async () => {
    if (!newSection.title) return;
    try {
      await fetch("/api/basel/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSection.title,
          chapterId: chapter?.id,
          order: chapter?.sections.length || 0,
        }),
      });
      setNewSection({ title: "" });
      setShowNewSection(false);
      fetchChapter();
    } catch (error) {
      console.error("Error creating section:", error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its content?")) return;
    try {
      await fetch(`/api/basel/sections/${id}`, { method: "DELETE" });
      fetchChapter();
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  // Subsection CRUD
  const handleCreateSubsection = async (sectionId: string) => {
    if (!newSubsection.number) return;
    try {
      await fetch("/api/basel/subsections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: newSubsection.number,
          content: newSubsection.content || "",
          sectionId,
        }),
      });
      setNewSubsection({ number: "", content: "" });
      setNewSubsectionFor(null);
      fetchChapter();
    } catch (error) {
      console.error("Error creating subsection:", error);
    }
  };

  const handleSaveSubsection = async (id: string) => {
    try {
      await fetch(`/api/basel/subsections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: subsectionContent }),
      });
      setEditingSubsection(null);
      fetchChapter();
    } catch (error) {
      console.error("Error saving subsection:", error);
    }
  };

  const handleDeleteSubsection = async (id: string) => {
    if (!confirm("Delete this subsection?")) return;
    try {
      await fetch(`/api/basel/subsections/${id}`, { method: "DELETE" });
      fetchChapter();
    } catch (error) {
      console.error("Error deleting subsection:", error);
    }
  };

  // Footnote CRUD
  const handleAddFootnote = async (subsectionId: string) => {
    if (!newFootnote.content) return;
    try {
      await fetch("/api/basel/footnotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newFootnote, subsectionId }),
      });
      setNewFootnote({ number: 1, content: "" });
      setAddingFootnote(null);
      fetchChapter();
    } catch (error) {
      console.error("Error adding footnote:", error);
    }
  };

  const handleDeleteFootnote = async (id: string) => {
    try {
      await fetch(`/api/basel/footnotes/${id}`, { method: "DELETE" });
      fetchChapter();
    } catch (error) {
      console.error("Error deleting footnote:", error);
    }
  };

  // FAQ CRUD
  const handleAddFAQ = async (subsectionId: string) => {
    if (!newFAQ.question || !newFAQ.answer) return;
    try {
      await fetch("/api/basel/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newFAQ, subsectionId }),
      });
      setNewFAQ({ question: "", answer: "" });
      setAddingFAQ(null);
      fetchChapter();
    } catch (error) {
      console.error("Error adding FAQ:", error);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      await fetch(`/api/basel/faqs/${id}`, { method: "DELETE" });
      fetchChapter();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubsection = (id: string) => {
    setExpandedSubsections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  if (!user || user.role !== "admin" || !chapter) {
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
          <p className="text-gray-500">Chapter not found.</p>
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
            href={`/admin/basel/standards/${chapter.standard.id}`}
            className="inline-flex items-center gap-2 text-[#355189] hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {chapter.standard.code}
          </Link>

          {/* Chapter Header */}
          <div className="bg-white rounded-2xl border border-[#E1E7EF] p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[#14213D]">
                {chapter.standard.code}
                {chapter.code} - {chapter.title}
              </h1>
              <button
                onClick={handleSaveChapter}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#355189] text-white rounded-lg font-semibold hover:bg-[#1B2B4B] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Chapter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={chapterForm.code}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Status
                </label>
                <select
                  value={chapterForm.status}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                >
                  <option value="current">Current</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#14213D]">
              Content Sections
            </h2>
            <button
              onClick={() => setShowNewSection(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F48C25] text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          {/* New Section Form */}
          {showNewSection && (
            <div className="bg-white rounded-2xl border border-[#E1E7EF] p-4 mb-4 flex gap-4">
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({ title: e.target.value })}
                placeholder="Section title (e.g., Consolidation)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
              />
              <button
                onClick={handleCreateSection}
                className="px-4 py-2 bg-[#F48C25] text-white rounded-lg font-semibold"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewSection(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Sections List */}
          <div className="space-y-4">
            {chapter.sections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
                <p className="text-gray-500">
                  No sections yet. Add a section to start building content.
                </p>
              </div>
            ) : (
              chapter.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-[#E1E7EF] overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-[#E1E7EF]">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 font-bold text-[#14213D]"
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {section.title}
                      <span className="text-xs text-gray-500 font-normal">
                        ({section.subsections.length} subsections)
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setNewSubsectionFor(section.id)}
                        className="text-xs px-2 py-1 text-[#355189] border border-[#355189] rounded hover:bg-[#355189] hover:text-white"
                      >
                        + Subsection
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section Content */}
                  {expandedSections.has(section.id) && (
                    <div className="p-4">
                      {/* New Subsection Form */}
                      {newSubsectionFor === section.id && (
                        <NewSubsectionEditor
                          onSave={async (number, content) => {
                            try {
                              await fetch("/api/basel/subsections", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  number,
                                  content,
                                  sectionId: section.id,
                                }),
                              });
                              setNewSubsectionFor(null);
                              fetchChapter();
                            } catch (error) {
                              console.error(
                                "Error creating subsection:",
                                error
                              );
                            }
                          }}
                          onCancel={() => setNewSubsectionFor(null)}
                          chapterCode={chapter.code}
                          standardCode={chapter.standard.code}
                        />
                      )}

                      {/* Subsections */}
                      {section.subsections.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                          No subsections yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {section.subsections.map((sub) => (
                            <div
                              key={sub.id}
                              className="border border-gray-200 rounded-lg"
                            >
                              {/* Subsection Header */}
                              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                <button
                                  onClick={() => toggleSubsection(sub.id)}
                                  className="flex items-center gap-2 font-medium text-[#F48C25] text-sm"
                                >
                                  {expandedSubsections.has(sub.id) ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  {chapter.standard.code}
                                  {chapter.code}.{sub.number}
                                </button>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingSubsection(sub.id);
                                      setSubsectionContent(sub.content);
                                    }}
                                    className="text-xs px-2 py-1 text-gray-600 hover:text-[#355189]"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setAddingFootnote(sub.id)}
                                    className="text-xs px-2 py-1 text-gray-600 hover:text-[#355189] flex items-center gap-1"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    +FN
                                  </button>
                                  <button
                                    onClick={() => setAddingFAQ(sub.id)}
                                    className="text-xs px-2 py-1 text-gray-600 hover:text-[#355189] flex items-center gap-1"
                                  >
                                    <HelpCircle className="w-3 h-3" />
                                    +FAQ
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSubsection(sub.id)
                                    }
                                    className="text-xs p-1 text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Subsection Content */}
                              {expandedSubsections.has(sub.id) && (
                                <div className="p-3">
                                  {editingSubsection === sub.id ? (
                                    <SubsectionEditor
                                      content={sub.content}
                                      onSave={async (content) => {
                                        try {
                                          await fetch(
                                            `/api/basel/subsections/${sub.id}`,
                                            {
                                              method: "PUT",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({ content }),
                                            }
                                          );
                                          setEditingSubsection(null);
                                          fetchChapter();
                                        } catch (error) {
                                          console.error(
                                            "Error saving subsection:",
                                            error
                                          );
                                        }
                                      }}
                                      onCancel={() =>
                                        setEditingSubsection(null)
                                      }
                                      chapterCode={chapter.code}
                                      standardCode={chapter.standard.code}
                                    />
                                  ) : (
                                    <div className="text-sm text-gray-700">
                                      {sub.content ? (
                                        <RichContentRenderer
                                          content={sub.content}
                                        />
                                      ) : (
                                        <span className="italic text-gray-400">
                                          No content yet.
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Footnotes */}
                                  {sub.footnotes.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        Footnotes
                                      </p>
                                      {sub.footnotes.map((fn) => (
                                        <div
                                          key={fn.id}
                                          className="flex items-start gap-2 text-xs text-gray-600 mb-1"
                                        >
                                          <span className="font-bold text-[#355189]">
                                            [{fn.number}]
                                          </span>
                                          <span className="flex-1">
                                            {fn.content}
                                          </span>
                                          <button
                                            onClick={() =>
                                              handleDeleteFootnote(fn.id)
                                            }
                                            className="text-red-400"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add Footnote Form */}
                                  {addingFootnote === sub.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 p-2 rounded">
                                      <div className="flex gap-2 mb-2">
                                        <input
                                          type="number"
                                          value={newFootnote.number}
                                          onChange={(e) =>
                                            setNewFootnote({
                                              ...newFootnote,
                                              number: parseInt(e.target.value),
                                            })
                                          }
                                          className="w-16 px-2 py-1 border rounded text-xs"
                                          placeholder="#"
                                        />
                                        <input
                                          type="text"
                                          value={newFootnote.content}
                                          onChange={(e) =>
                                            setNewFootnote({
                                              ...newFootnote,
                                              content: e.target.value,
                                            })
                                          }
                                          className="flex-1 px-2 py-1 border rounded text-xs"
                                          placeholder="Footnote content..."
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            handleAddFootnote(sub.id)
                                          }
                                          className="px-2 py-1 bg-[#355189] text-white rounded text-xs"
                                        >
                                          Add
                                        </button>
                                        <button
                                          onClick={() =>
                                            setAddingFootnote(null)
                                          }
                                          className="px-2 py-1 border rounded text-xs"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* FAQs */}
                                  {sub.faqs.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3" />
                                        FAQs
                                      </p>
                                      {sub.faqs.map((faq) => (
                                        <div
                                          key={faq.id}
                                          className="text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded"
                                        >
                                          <div className="flex justify-between">
                                            <p className="font-semibold">
                                              Q: {faq.question}
                                            </p>
                                            <button
                                              onClick={() =>
                                                handleDeleteFAQ(faq.id)
                                              }
                                              className="text-red-400"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                          <p className="mt-1">
                                            A: {faq.answer}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add FAQ Form */}
                                  {addingFAQ === sub.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 p-2 rounded">
                                      <input
                                        type="text"
                                        value={newFAQ.question}
                                        onChange={(e) =>
                                          setNewFAQ({
                                            ...newFAQ,
                                            question: e.target.value,
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-xs mb-2"
                                        placeholder="Question..."
                                      />
                                      <textarea
                                        value={newFAQ.answer}
                                        onChange={(e) =>
                                          setNewFAQ({
                                            ...newFAQ,
                                            answer: e.target.value,
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-xs mb-2"
                                        placeholder="Answer..."
                                        rows={2}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleAddFAQ(sub.id)}
                                          className="px-2 py-1 bg-[#355189] text-white rounded text-xs"
                                        >
                                          Add
                                        </button>
                                        <button
                                          onClick={() => setAddingFAQ(null)}
                                          className="px-2 py-1 border rounded text-xs"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
