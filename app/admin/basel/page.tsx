"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react";

interface Standard {
  id: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
  chapters: {
    id: string;
    code: string;
    title: string;
  }[];
}

interface Update {
  id: string;
  title: string;
  date: string;
}

export default function AdminBaselPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New standard form
  const [showNewStandard, setShowNewStandard] = useState(false);
  const [newStandard, setNewStandard] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  // New update form
  const [showNewUpdate, setShowNewUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [creatingUpdate, setCreatingUpdate] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [standardsRes, updatesRes] = await Promise.all([
        fetch("/api/basel/standards"),
        fetch("/api/basel/updates?limit=10"),
      ]);
      const standardsData = await standardsRes.json();
      const updatesData = await updatesRes.json();
      setStandards(standardsData.standards || []);
      setUpdates(updatesData.updates || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/basel/standards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStandard),
      });

      if (res.ok) {
        setNewStandard({ code: "", name: "", description: "" });
        setShowNewStandard(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create standard");
      }
    } catch (error) {
      console.error("Error creating standard:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStandard = async (id: string) => {
    if (
      !confirm(
        "Delete this standard and all its chapters? This cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/basel/standards/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete standard");
      }
    } catch (error) {
      console.error("Error deleting standard:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUpdate(true);

    try {
      const res = await fetch("/api/basel/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUpdate),
      });

      if (res.ok) {
        setNewUpdate({ title: "", description: "", link: "" });
        setShowNewUpdate(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create update");
      }
    } catch (error) {
      console.error("Error creating update:", error);
    } finally {
      setCreatingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    try {
      await fetch(`/api/basel/updates/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Error deleting update:", error);
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

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar />

      <main className="w-full flex-1 lg:ml-[280px] relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 px-6 lg:px-12 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#14213D]">
                Basel Framework <span className="text-purple-600">Admin</span>
              </h1>
              <p className="text-gray-500 text-sm">
                Manage standards, chapters, and content
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Standards Management */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#14213D]">Standards</h2>
                <button
                  onClick={() => setShowNewStandard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#355189] text-white rounded-lg text-sm font-semibold hover:bg-[#1B2B4B] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Standard
                </button>
              </div>

              {/* New Standard Form */}
              {showNewStandard && (
                <form
                  onSubmit={handleCreateStandard}
                  className="bg-white rounded-2xl border border-[#E1E7EF] p-6 mb-4"
                >
                  <h3 className="font-bold text-[#14213D] mb-4">
                    New Standard
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#14213D] mb-1">
                        Code *
                      </label>
                      <input
                        type="text"
                        value={newStandard.code}
                        onChange={(e) =>
                          setNewStandard({
                            ...newStandard,
                            code: e.target.value,
                          })
                        }
                        placeholder="SCO"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#14213D] mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={newStandard.name}
                        onChange={(e) =>
                          setNewStandard({
                            ...newStandard,
                            name: e.target.value,
                          })
                        }
                        placeholder="Scope of application"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#14213D] mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newStandard.description}
                      onChange={(e) =>
                        setNewStandard({
                          ...newStandard,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-[#355189] text-white rounded-lg text-sm font-semibold hover:bg-[#1B2B4B] disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create Standard"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewStandard(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Standards List */}
              <div className="space-y-3">
                {standards.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No standards yet. Create your first one!
                    </p>
                  </div>
                ) : (
                  standards.map((standard) => (
                    <div
                      key={standard.id}
                      className="bg-white rounded-2xl border border-[#E1E7EF] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#1B2B4B] to-[#355189] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {standard.code}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-[#14213D]">
                              {standard.code} - {standard.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {standard.chapters.length} chapters
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/basel/standards/${standard.id}`}
                            className="p-2 text-[#355189] hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteStandard(standard.id)}
                            disabled={deleting === standard.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting === standard.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/basel/standards/${standard.id}`}
                            className="p-2 text-gray-400 hover:text-[#355189]"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Updates Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#14213D]">Updates</h2>
                <button
                  onClick={() => setShowNewUpdate(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#F48C25] text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* New Update Form */}
              {showNewUpdate && (
                <form
                  onSubmit={handleCreateUpdate}
                  className="bg-white rounded-2xl border border-[#E1E7EF] p-4 mb-4"
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newUpdate.title}
                      onChange={(e) =>
                        setNewUpdate({ ...newUpdate, title: e.target.value })
                      }
                      placeholder="Update title *"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                    />
                    <input
                      type="text"
                      value={newUpdate.description}
                      onChange={(e) =>
                        setNewUpdate({
                          ...newUpdate,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                    />
                    <input
                      type="text"
                      value={newUpdate.link}
                      onChange={(e) =>
                        setNewUpdate({ ...newUpdate, link: e.target.value })
                      }
                      placeholder="Link (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={creatingUpdate}
                        className="px-3 py-1.5 bg-[#F48C25] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {creatingUpdate ? "..." : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewUpdate(false)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl border border-[#E1E7EF] overflow-hidden">
                {updates.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No updates yet.
                  </p>
                ) : (
                  updates.map((update) => (
                    <div
                      key={update.id}
                      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-[#14213D] text-sm">
                          {update.title}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(update.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
