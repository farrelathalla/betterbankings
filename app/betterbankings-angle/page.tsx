"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Search, Calendar, Clock, Play, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PodcastCategory {
  id: string;
  name: string;
  order: number;
}

interface PodcastSpeaker {
  id: string;
  name: string;
  title: string;
}

interface PodcastTopic {
  id: string;
  name: string;
}

interface Podcast {
  id: string;
  label: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  link: string;
  category: PodcastCategory;
  speakers: PodcastSpeaker[];
  topics: PodcastTopic[];
}

export default function BetterBankingsAnglePage() {
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      const categoriesRes = await fetch("/api/angle/categories");
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/angle/podcasts?${params.toString()}`);
      const data = await res.json();
      setPodcasts(data.podcasts || []);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Gradient colors for podcast thumbnails - cycling through
  const gradientColors = [
    "from-amber-500 to-orange-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-rose-500 to-red-600",
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar />

      <main className="w-full flex-1 lg:ml-[280px] relative">
        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 px-6 lg:px-12 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#14213D] mb-3">
              <span className="text-[#1B2B4B]">BetterBankings</span>{" "}
              <span className="text-[#F48C25]">Angle</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Conversations with industry leaders about banking regulation, risk
              management, and the future of finance in Southeast Asia
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search episodes, guests, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E1E7EF] rounded-xl text-sm focus:ring-2 focus:ring-[#F48C25] outline-none transition-all"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <h3 className="text-sm font-bold text-[#14213D] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#14213D] rounded-full"></span>
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    selectedCategory === null
                      ? "bg-[#F48C25] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  All Episodes
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                      selectedCategory === category.id
                        ? "bg-[#F48C25] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Podcasts List */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-[#F48C25] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : podcasts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#14213D] mb-2">
                    No episodes found
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? "Try a different search term"
                      : "Check back later for new episodes"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {podcasts.map((podcast, index) => (
                    <a
                      key={podcast.id}
                      href={podcast.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white rounded-2xl border border-[#E1E7EF] p-5 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row gap-5">
                        {/* Thumbnail */}
                        <div
                          className={cn(
                            "w-full md:w-40 h-40 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                            gradientColors[index % gradientColors.length]
                          )}
                        >
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Meta Row */}
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-xs font-semibold text-[#355189] bg-[#E0E7FF] px-2.5 py-1 rounded-full">
                              {podcast.label}
                            </span>
                            <span className="text-xs font-medium text-white bg-[#F48C25] px-2.5 py-1 rounded-full">
                              {podcast.category.name}
                            </span>
                          </div>

                          {/* Date & Duration */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(podcast.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {podcast.duration}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-[#14213D] mb-2 group-hover:text-[#F48C25] transition-colors">
                            {podcast.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {podcast.description}
                          </p>

                          {/* Speakers */}
                          {podcast.speakers.length > 0 && (
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#355189] to-[#1B2B4B] rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#355189]">
                                  {podcast.speakers[0].name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {podcast.speakers[0].title}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Topics */}
                          {podcast.topics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Topics:
                              </span>
                              {podcast.topics.map((topic) => (
                                <span
                                  key={topic.id}
                                  className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200"
                                >
                                  {topic.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 mb-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#14213D] mb-3">
              Never Miss an Episode
            </h2>
            <p className="text-gray-500 mb-6">
              Subscribe to our newsletter to get notified when new episodes drop
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
