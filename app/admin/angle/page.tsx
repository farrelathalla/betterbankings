"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Mic,
  FolderOpen,
  X,
  Save,
  Link as LinkIcon,
  Calendar,
  Clock,
  User,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  order: number;
  _count?: { podcasts: number };
}

interface Speaker {
  name: string;
  title: string;
}

interface Podcast {
  id: string;
  label: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  link: string;
  categoryId: string;
  category: Category;
  speakers: { id: string; name: string; title: string }[];
  topics: { id: string; name: string }[];
}

export default function AdminAnglePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Podcasts state
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [savingPodcast, setSavingPodcast] = useState(false);
  const [deletingPodcast, setDeletingPodcast] = useState<string | null>(null);

  // Podcast form state
  const [podcastForm, setPodcastForm] = useState({
    label: "",
    title: "",
    description: "",
    date: "",
    duration: "",
    link: "",
    categoryId: "",
    speakers: [{ name: "", title: "" }] as Speaker[],
    topics: [""] as string[],
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch data
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/angle/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchPodcasts = useCallback(async () => {
    try {
      const res = await fetch("/api/angle/podcasts");
      const data = await res.json();
      setPodcasts(data.podcasts || []);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoadingPodcasts(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCategories();
      fetchPodcasts();
    }
  }, [user, fetchCategories, fetchPodcasts]);

  // Category handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCreatingCategory(true);
    try {
      const res = await fetch("/api/angle/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (res.ok) {
        setNewCategoryName("");
        setShowNewCategory(false);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const res = await fetch(`/api/angle/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategory.name }),
      });

      if (res.ok) {
        setEditingCategory(null);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Delete this category? Podcasts in this category must be moved first."
      )
    ) {
      return;
    }

    setDeletingCategory(id);
    try {
      const res = await fetch(`/api/angle/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeletingCategory(null);
    }
  };

  // Podcast handlers
  const resetPodcastForm = () => {
    setPodcastForm({
      label: "",
      title: "",
      description: "",
      date: "",
      duration: "",
      link: "",
      categoryId: "",
      speakers: [{ name: "", title: "" }],
      topics: [""],
    });
    setEditingPodcast(null);
  };

  const openNewPodcastForm = () => {
    resetPodcastForm();
    setShowPodcastForm(true);
  };

  const openEditPodcastForm = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setPodcastForm({
      label: podcast.label,
      title: podcast.title,
      description: podcast.description,
      date: new Date(podcast.date).toISOString().split("T")[0],
      duration: podcast.duration,
      link: podcast.link,
      categoryId: podcast.categoryId,
      speakers:
        podcast.speakers.length > 0
          ? podcast.speakers.map((s) => ({ name: s.name, title: s.title }))
          : [{ name: "", title: "" }],
      topics:
        podcast.topics.length > 0 ? podcast.topics.map((t) => t.name) : [""],
    });
    setShowPodcastForm(true);
  };

  const handleSavePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPodcast(true);

    try {
      const payload = {
        ...podcastForm,
        speakers: podcastForm.speakers.filter((s) => s.name.trim()),
        topics: podcastForm.topics.filter((t) => t.trim()),
      };

      const url = editingPodcast
        ? `/api/angle/podcasts/${editingPodcast.id}`
        : "/api/angle/podcasts";

      const res = await fetch(url, {
        method: editingPodcast ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowPodcastForm(false);
        resetPodcastForm();
        fetchPodcasts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save podcast");
      }
    } catch (error) {
      console.error("Error saving podcast:", error);
    } finally {
      setSavingPodcast(false);
    }
  };

  const handleDeletePodcast = async (id: string) => {
    if (!confirm("Delete this podcast? This cannot be undone.")) {
      return;
    }

    setDeletingPodcast(id);
    try {
      const res = await fetch(`/api/angle/podcasts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPodcasts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete podcast");
      }
    } catch (error) {
      console.error("Error deleting podcast:", error);
    } finally {
      setDeletingPodcast(null);
    }
  };

  // Speaker/Topic handlers
  const addSpeaker = () => {
    setPodcastForm({
      ...podcastForm,
      speakers: [...podcastForm.speakers, { name: "", title: "" }],
    });
  };

  const removeSpeaker = (index: number) => {
    setPodcastForm({
      ...podcastForm,
      speakers: podcastForm.speakers.filter((_, i) => i !== index),
    });
  };

  const updateSpeaker = (
    index: number,
    field: "name" | "title",
    value: string
  ) => {
    const newSpeakers = [...podcastForm.speakers];
    newSpeakers[index][field] = value;
    setPodcastForm({ ...podcastForm, speakers: newSpeakers });
  };

  const addTopic = () => {
    setPodcastForm({
      ...podcastForm,
      topics: [...podcastForm.topics, ""],
    });
  };

  const removeTopic = (index: number) => {
    setPodcastForm({
      ...podcastForm,
      topics: podcastForm.topics.filter((_, i) => i !== index),
    });
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...podcastForm.topics];
    newTopics[index] = value;
    setPodcastForm({ ...podcastForm, topics: newTopics });
  };

  if (authLoading || (loadingCategories && loadingPodcasts)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 lg:ml-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F48C25]" />
        </main>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar />

      <main className="w-full flex-1 lg:ml-[280px] relative">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-amber-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 px-6 lg:px-12 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F48C25] to-orange-600 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#14213D]">
                BetterBankings Angle{" "}
                <span className="text-[#F48C25]">Admin</span>
              </h1>
              <p className="text-gray-500 text-sm">
                Manage podcast categories and episodes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Categories Panel */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#14213D] flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Categories
                </h2>
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#F48C25] text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* New Category Form */}
              {showNewCategory && (
                <form
                  onSubmit={handleCreateCategory}
                  className="bg-white rounded-xl border border-[#E1E7EF] p-4 mb-4"
                >
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creatingCategory}
                      className="px-3 py-1.5 bg-[#F48C25] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {creatingCategory ? "..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Categories List */}
              <div className="bg-white rounded-xl border border-[#E1E7EF] overflow-hidden">
                {categories.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No categories yet.
                  </p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      {editingCategory?.id === category.id ? (
                        <form
                          onSubmit={handleUpdateCategory}
                          className="flex items-center gap-2 flex-1"
                        >
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                name: e.target.value,
                              })
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-[#F48C25]"
                          />
                          <button
                            type="submit"
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium text-[#14213D] text-sm">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {category._count?.podcasts || 0} podcasts
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-1.5 text-gray-400 hover:text-[#F48C25] hover:bg-orange-50 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={deletingCategory === category.id}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                              {deletingCategory === category.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Podcasts Panel */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#14213D] flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Podcasts
                </h2>
                <button
                  onClick={openNewPodcastForm}
                  className="flex items-center gap-2 px-4 py-2 bg-[#355189] text-white rounded-lg text-sm font-semibold hover:bg-[#1B2B4B] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Podcast
                </button>
              </div>

              {/* Podcast Form Modal */}
              {showPodcastForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-[#14213D]">
                        {editingPodcast ? "Edit Podcast" : "New Podcast"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowPodcastForm(false);
                          resetPodcastForm();
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSavePodcast}
                      className="p-6 space-y-5"
                    >
                      {/* Label & Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#14213D] mb-1">
                            Label *
                          </label>
                          <input
                            type="text"
                            value={podcastForm.label}
                            onChange={(e) =>
                              setPodcastForm({
                                ...podcastForm,
                                label: e.target.value,
                              })
                            }
                            placeholder="Season 2 • Ep. 12"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#14213D] mb-1">
                            Category *
                          </label>
                          <select
                            value={podcastForm.categoryId}
                            onChange={(e) =>
                              setPodcastForm({
                                ...podcastForm,
                                categoryId: e.target.value,
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Date & Duration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#14213D] mb-1">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date *
                          </label>
                          <input
                            type="date"
                            value={podcastForm.date}
                            onChange={(e) =>
                              setPodcastForm({
                                ...podcastForm,
                                date: e.target.value,
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#14213D] mb-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Duration *
                          </label>
                          <input
                            type="text"
                            value={podcastForm.duration}
                            onChange={(e) =>
                              setPodcastForm({
                                ...podcastForm,
                                duration: e.target.value,
                              })
                            }
                            placeholder="42 min"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                          />
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={podcastForm.title}
                          onChange={(e) =>
                            setPodcastForm({
                              ...podcastForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="The Future of Banking Regulation in Southeast Asia"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-1">
                          Description *
                        </label>
                        <textarea
                          value={podcastForm.description}
                          onChange={(e) =>
                            setPodcastForm({
                              ...podcastForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="An in-depth discussion on upcoming regulatory changes..."
                          required
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none resize-none"
                        />
                      </div>

                      {/* Link */}
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-1">
                          <LinkIcon className="w-4 h-4 inline mr-1" />
                          Podcast Link *
                        </label>
                        <input
                          type="url"
                          value={podcastForm.link}
                          onChange={(e) =>
                            setPodcastForm({
                              ...podcastForm,
                              link: e.target.value,
                            })
                          }
                          placeholder="https://open.spotify.com/episode/..."
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                        />
                      </div>

                      {/* Speakers */}
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          Speakers
                        </label>
                        <div className="space-y-3">
                          {podcastForm.speakers.map((speaker, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={speaker.name}
                                onChange={(e) =>
                                  updateSpeaker(index, "name", e.target.value)
                                }
                                placeholder="Name"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                              />
                              <input
                                type="text"
                                value={speaker.title}
                                onChange={(e) =>
                                  updateSpeaker(index, "title", e.target.value)
                                }
                                placeholder="Title/Role"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                              />
                              {podcastForm.speakers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSpeaker(index)}
                                  className="p-2 text-red-400 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addSpeaker}
                            className="text-sm text-[#F48C25] hover:text-orange-600 font-medium"
                          >
                            + Add Speaker
                          </button>
                        </div>
                      </div>

                      {/* Topics */}
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-2">
                          <Tag className="w-4 h-4 inline mr-1" />
                          Topics
                        </label>
                        <div className="space-y-2">
                          {podcastForm.topics.map((topic, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={topic}
                                onChange={(e) =>
                                  updateTopic(index, e.target.value)
                                }
                                placeholder="e.g., Basel IV, Compliance"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F48C25] outline-none"
                              />
                              {podcastForm.topics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTopic(index)}
                                  className="p-2 text-red-400 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addTopic}
                            className="text-sm text-[#F48C25] hover:text-orange-600 font-medium"
                          >
                            + Add Topic
                          </button>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          type="submit"
                          disabled={savingPodcast}
                          className="flex-1 px-4 py-2.5 bg-[#355189] text-white rounded-lg font-semibold hover:bg-[#1B2B4B] disabled:opacity-50 transition-colors"
                        >
                          {savingPodcast ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </span>
                          ) : editingPodcast ? (
                            "Update Podcast"
                          ) : (
                            "Create Podcast"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPodcastForm(false);
                            resetPodcastForm();
                          }}
                          className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Podcasts List */}
              <div className="space-y-3">
                {podcasts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
                    <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No podcasts yet. Create your first one!
                    </p>
                  </div>
                ) : (
                  podcasts.map((podcast) => (
                    <div
                      key={podcast.id}
                      className="bg-white rounded-xl border border-[#E1E7EF] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#355189] bg-[#E0E7FF] px-2 py-0.5 rounded-full">
                              {podcast.label}
                            </span>
                            <span className="text-xs font-medium text-white bg-[#F48C25] px-2 py-0.5 rounded-full">
                              {podcast.category.name}
                            </span>
                          </div>
                          <h3 className="font-bold text-[#14213D] mb-1">
                            {podcast.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {podcast.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>
                              {new Date(podcast.date).toLocaleDateString()}
                            </span>
                            <span>{podcast.duration}</span>
                            {podcast.speakers.length > 0 && (
                              <span>{podcast.speakers[0].name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEditPodcastForm(podcast)}
                            className="p-2 text-[#355189] hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePodcast(podcast.id)}
                            disabled={deletingPodcast === podcast.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingPodcast === podcast.id ? (
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
          </div>
        </div>
      </main>
    </div>
  );
}
