"use client";

import { useState, useEffect, use, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Calendar,
  Download,
  HelpCircle,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

// Dynamically import RichContentRenderer to avoid SSR issues
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
}

interface Subsection {
  id: string;
  number: string;
  content: string;
  footnotes: Footnote[];
  faqs: FAQ[];
}

interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

interface Chapter {
  id: string;
  code: string;
  title: string;
  status: string;
  effectiveDate: string | null;
  lastUpdate: string | null;
  pdfs?: { id: string; name: string; url: string; createdAt: string }[];
  standard: {
    id: string;
    code: string;
    name: string;
  };
  sections: Section[];
}

// Expandable section component
function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
  count = 0,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  count?: number;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-[#E1E7EF] rounded-lg overflow-hidden mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#355189]" />
          <span className="font-semibold text-[#14213D] text-sm">{title}</span>
          {count > 0 && (
            <span className="text-xs bg-[#355189] text-white px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 py-3 bg-white border-t border-[#E1E7EF]">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ChapterPage({
  params,
}: {
  params: Promise<{ standard: string; chapter: string }>;
}) {
  const resolvedParams = use(params);
  const standardCode = resolvedParams.standard.toUpperCase();
  const chapterCode = resolvedParams.chapter;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll back navigation stack
  const [scrollStack, setScrollStack] = useState<number[]>([]);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        // Get chapters filtered by standard code
        const chaptersRes = await fetch(
          `/api/basel/chapters?standardCode=${standardCode}`
        );
        const chaptersData = await chaptersRes.json();

        const foundChapter = chaptersData.chapters?.find(
          (c: { code: string }) => c.code === chapterCode
        );

        if (foundChapter) {
          // Fetch full chapter with content
          const detailRes = await fetch(
            `/api/basel/chapters/${foundChapter.id}`
          );
          const detailData = await detailRes.json();
          setChapter(detailData.chapter);
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [standardCode, chapterCode]);

  // Handle URL hash for scrolling to sections
  useEffect(() => {
    if (typeof window !== "undefined" && chapter) {
      const hash = window.location.hash.slice(1);
      if (hash && sectionRefs.current[hash]) {
        sectionRefs.current[hash]?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [chapter]);

  // Listen for same-page reference clicks
  useEffect(() => {
    const handleReferenceClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link =
        target.closest('a[href^="#"]') ||
        target.closest(`a[href*="${chapterCode}#"]`);

      if (link) {
        const href = link.getAttribute("href");
        // Check if it's a same-page anchor or same-chapter link
        if (href?.startsWith("#") || href?.includes(`/${chapterCode}#`)) {
          // Save current scroll position before navigating
          setScrollStack((prev) => [...prev, window.scrollY]);
        }
      }
    };

    document.addEventListener("click", handleReferenceClick);
    return () => document.removeEventListener("click", handleReferenceClick);
  }, [chapterCode]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth" });
  };

  // Go back to previous scroll position
  const handleScrollBack = () => {
    if (scrollStack.length > 0) {
      const prevPosition = scrollStack[scrollStack.length - 1];
      setScrollStack((prev) => prev.slice(0, -1));
      window.scrollTo({ top: prevPosition, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 lg:ml-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#355189]" />
        </main>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 lg:ml-[280px] relative">
          <div className="px-6 lg:px-12 py-8">
            <Link
              href={`/basel-center/${standardCode.toLowerCase()}`}
              className="inline-flex items-center gap-2 text-[#355189] hover:underline mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {standardCode}
            </Link>
            <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
              <h2 className="text-xl font-bold text-[#14213D] mb-2">
                Chapter Not Found
              </h2>
              <p className="text-gray-500">
                The chapter &quot;{standardCode}
                {chapterCode}&quot; does not exist.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link
              href="/basel-center"
              className="text-[#355189] hover:underline"
            >
              Basel Center
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={`/basel-center/${standardCode.toLowerCase()}`}
              className="text-[#355189] hover:underline"
            >
              {chapter.standard.code}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">
              {chapter.standard.code}
              {chapter.code}
            </span>
          </div>

          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-[#E1E7EF] p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#14213D] mb-2">
                      {chapter.standard.code}
                      {chapter.code} - {chapter.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {chapter.effectiveDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Effective:{" "}
                          {new Date(chapter.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                      {chapter.lastUpdate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Updated:{" "}
                          {new Date(chapter.lastUpdate).toLocaleDateString()}
                        </span>
                      )}
                      {chapter.status === "archived" && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* PDF Documents List */}
                {chapter.pdfs && chapter.pdfs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E1E7EF]">
                    <p className="text-sm font-semibold text-[#14213D] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#355189]" />
                      Related Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chapter.pdfs.map((pdf) => (
                        <a
                          key={pdf.id}
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-[#355189] hover:text-white hover:border-[#355189] transition-colors group"
                        >
                          <FileText className="w-4 h-4 text-red-500 group-hover:text-white" />
                          <span>{pdf.name}</span>
                          <Download className="w-3 h-3 opacity-50" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sections Content */}
              {chapter.sections.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E1E7EF] p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No content in this chapter yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {chapter.sections.map((section) => (
                    <div
                      key={section.id}
                      id={section.id}
                      ref={(el) => {
                        sectionRefs.current[section.id] = el;
                      }}
                      className="bg-white rounded-2xl border border-[#E1E7EF] p-6"
                    >
                      <h2 className="text-xl font-bold text-[#14213D] mb-4 pb-3 border-b border-[#E1E7EF]">
                        {section.title}
                      </h2>

                      {section.subsections.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No content in this section yet.
                        </p>
                      ) : (
                        <div className="space-y-6">
                          {section.subsections.map((subsection) => {
                            // Create anchor ID matching the reference format: {STANDARD}{CHAPTER}.{NUMBER}
                            const anchorId = `${chapter.standard.code}${chapter.code}.${subsection.number}`;

                            return (
                              <div
                                key={subsection.id}
                                id={anchorId}
                                ref={(el) => {
                                  sectionRefs.current[subsection.id] = el;
                                  sectionRefs.current[anchorId] = el;
                                }}
                                className="pl-4 border-l-2 border-[#E1E7EF] scroll-mt-24"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="font-bold text-[#F48C25] text-sm whitespace-nowrap">
                                    {chapter.standard.code}
                                    {chapter.code}.{subsection.number}
                                  </span>
                                  <div className="flex-1">
                                    <RichContentRenderer
                                      content={subsection.content}
                                    />

                                    {/* Footnotes */}
                                    {subsection.footnotes.length > 0 && (
                                      <ExpandableSection
                                        title="Footnotes"
                                        icon={BookOpen}
                                        count={subsection.footnotes.length}
                                      >
                                        <div className="space-y-3">
                                          {subsection.footnotes.map((fn) => (
                                            <div
                                              key={fn.id}
                                              className="flex gap-2 text-sm"
                                            >
                                              <span className="font-bold text-[#355189]">
                                                [{fn.number}]
                                              </span>
                                              <p className="text-gray-600">
                                                {fn.content}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </ExpandableSection>
                                    )}

                                    {/* FAQs */}
                                    {subsection.faqs.length > 0 && (
                                      <ExpandableSection
                                        title="FAQ"
                                        icon={HelpCircle}
                                        count={subsection.faqs.length}
                                      >
                                        <div className="space-y-4">
                                          {subsection.faqs.map((faq) => (
                                            <div key={faq.id}>
                                              <p className="font-semibold text-[#14213D] text-sm mb-1">
                                                Q: {faq.question}
                                              </p>
                                              <p className="text-gray-600 text-sm">
                                                A: {faq.answer}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </ExpandableSection>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar - Go to Section */}
            {chapter.sections.length > 0 && (
              <div className="hidden xl:block w-64 flex-shrink-0">
                <div className="sticky top-8 bg-white rounded-2xl border border-[#E1E7EF] p-4">
                  <h3 className="font-bold text-[#14213D] mb-3 text-sm">
                    Go to section
                  </h3>
                  <nav className="space-y-1">
                    {chapter.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? "bg-[#355189] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Scroll Back Button */}
        {scrollStack.length > 0 && (
          <button
            onClick={handleScrollBack}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#355189] text-white rounded-xl shadow-lg hover:bg-[#1B2B4B] transition-all hover:scale-105 group"
            title="Go back to where you clicked the reference"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
            {scrollStack.length > 1 && (
              <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded">
                {scrollStack.length}
              </span>
            )}
          </button>
        )}
      </main>
    </div>
  );
}
