"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Footer from "@/components/Footer";

interface Standard {
  id: string;
  code: string;
  name: string;
  description: string | null;
  chapters: {
    id: string;
    code: string;
    title: string;
    status: string;
  }[];
}

interface Update {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  date: string;
}

interface SearchResult {
  type: string;
  id: string;
  code: string;
  title: string;
  url: string;
}

export default function BaselCenterPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(
    new Set()
  );
  const [updatesExpanded, setUpdatesExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [standardsRes, updatesRes] = await Promise.all([
          fetch("/api/basel/standards"),
          fetch("/api/basel/updates?limit=5"),
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

    fetchData();
  }, []);

  const toggleStandard = (id: string) => {
    setExpandedStandards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/basel/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      const results: SearchResult[] = [
        ...(data.results?.standards || []),
        ...(data.results?.chapters || []),
        ...(data.results?.sections || []),
        ...(data.results?.subsections || []),
      ];

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar />

      <main className="w-full flex-1 lg:ml-[280px] relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-orange-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 px-6 lg:px-12 py-8 pt-24">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#14213D] mb-2">
              Basel <span className="text-[#F48C25]">Framework</span>
            </h1>
            <p className="text-gray-500">
              The full set of standards for the prudential regulation of banks
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search the Basel Framework..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E1E7EF] bg-white focus:ring-2 focus:ring-[#355189] focus:border-transparent outline-none transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E1E7EF] shadow-lg max-h-80 overflow-y-auto z-20">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#F48C25] font-semibold uppercase">
                        {result.code}
                      </span>
                      <p className="text-sm text-[#14213D] truncate">
                        {result.title}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">
                      {result.type}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Standards List */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#355189]" />
                </div>
              ) : standards.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#14213D] mb-2">
                    No Standards Yet
                  </h3>
                  <p className="text-gray-500">
                    Basel Framework standards will appear here once created.
                  </p>
                </div>
              ) : (
                standards.map((standard) => (
                  <div
                    key={standard.id}
                    className="bg-white rounded-2xl border border-[#E1E7EF] overflow-hidden"
                  >
                    {/* Standard Header */}
                    <button
                      onClick={() => toggleStandard(standard.id)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1B2B4B] to-[#355189] rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {standard.code}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-[#14213D]">
                            {standard.code} - {standard.name}
                          </h3>
                          {standard.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {standard.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {expandedStandards.has(standard.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Chapters List */}
                    {expandedStandards.has(standard.id) && (
                      <div className="border-t border-[#E1E7EF] bg-gray-50">
                        {standard.chapters.length === 0 ? (
                          <p className="px-6 py-4 text-sm text-gray-500">
                            No chapters in this standard yet.
                          </p>
                        ) : (
                          standard.chapters.map((chapter) => (
                            <Link
                              key={chapter.id}
                              href={`/basel-center/${standard.code.toLowerCase()}/${
                                chapter.code
                              }`}
                              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <FileText className="w-4 h-4 text-[#355189]" />
                              <span className="font-medium text-[#14213D]">
                                {standard.code}
                                {chapter.code}
                              </span>
                              <span className="text-gray-500">
                                {chapter.title}
                              </span>
                              {chapter.status === "archived" && (
                                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                  Archived
                                </span>
                              )}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Sidebar - Updates */}
            <div className="space-y-6">
              {/* Updates Card */}
              <div className="bg-white rounded-2xl border border-[#E1E7EF] overflow-hidden">
                <button
                  onClick={() => setUpdatesExpanded(!updatesExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#F48C25]" />
                    <span className="font-bold text-[#14213D]">
                      Recent Updates
                    </span>
                  </div>
                  {updatesExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {updatesExpanded && (
                  <div className="border-t border-[#E1E7EF]">
                    {updates.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-gray-500">
                        No updates yet.
                      </p>
                    ) : (
                      updates.map((update) => (
                        <div
                          key={update.id}
                          className="px-6 py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-[#14213D] text-sm">
                                {update.title}
                              </p>
                              {update.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {update.description}
                                </p>
                              )}
                            </div>
                            {update.link && (
                              <Link href={update.link}>
                                <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#355189]" />
                              </Link>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(update.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1B2B4B] to-[#355189] text-white">
                <h3 className="font-bold mb-3">About Basel Framework</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  The Basel Framework is the full set of standards of the Basel
                  Committee on Banking Supervision (BCBS), which is the primary
                  global standard setter for the prudential regulation of banks.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
