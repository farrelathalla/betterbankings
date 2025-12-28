"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Dynamically import the RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center h-[200px]">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    ),
  }
);

interface Standard {
  id: string;
  code: string;
  name: string;
  chapters: Array<{
    id: string;
    code: string;
    title: string;
    sections?: Array<{
      id: string;
      title: string;
      subsections?: Array<{ id: string; number: string }>;
    }>;
  }>;
}

interface SubsectionEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
  chapterCode: string;
  standardCode: string;
}

export default function SubsectionEditor({
  content,
  onSave,
  onCancel,
  chapterCode,
  standardCode,
}: SubsectionEditorProps) {
  const [editorContent, setEditorContent] = useState<string>(content || "");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch standards for reference selector
  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const res = await fetch("/api/basel/standards");
        const data = await res.json();
        setStandards(data.standards || []);
      } catch (error) {
        console.error("Error fetching standards:", error);
      }
    };
    fetchStandards();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert editor content to JSON string if needed
      const contentToSave =
        typeof editorContent === "object"
          ? JSON.stringify(editorContent)
          : editorContent;
      await onSave(contentToSave);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 mb-2">
        <span className="font-semibold">
          Editing {standardCode}
          {chapterCode}
        </span>
        {" • "}
        <span>Use the toolbar to add tooltips and references</span>
      </div>

      <RichTextEditor
        content={content}
        onChange={(newContent) => {
          // Handle both string and object content
          const stringContent =
            typeof newContent === "object"
              ? JSON.stringify(newContent)
              : newContent;
          setEditorContent(stringContent);
        }}
        placeholder="Enter subsection content..."
        standards={standards}
      />

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#355189] text-white rounded-lg text-sm font-semibold hover:bg-[#1B2B4B] disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// New subsection creator with rich text editor
interface NewSubsectionEditorProps {
  onSave: (number: string, content: string) => Promise<void>;
  onCancel: () => void;
  chapterCode: string;
  standardCode: string;
}

export function NewSubsectionEditor({
  onSave,
  onCancel,
  chapterCode,
  standardCode,
}: NewSubsectionEditorProps) {
  const [number, setNumber] = useState("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch standards for reference selector
  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const res = await fetch("/api/basel/standards");
        const data = await res.json();
        setStandards(data.standards || []);
      } catch (error) {
        console.error("Error fetching standards:", error);
      }
    };
    fetchStandards();
  }, []);

  const handleSave = async () => {
    if (!number) return;
    setSaving(true);
    try {
      const contentToSave =
        typeof editorContent === "object"
          ? JSON.stringify(editorContent)
          : editorContent;
      await onSave(number, contentToSave);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 space-y-3">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Number (e.g., 1)"
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <span className="text-gray-500 text-sm">
          → {standardCode}
          {chapterCode}.{number || "X"}
        </span>
      </div>

      <div className="text-xs text-gray-500">
        <span>Use the toolbar to add tooltips and references</span>
      </div>

      <RichTextEditor
        content=""
        onChange={(newContent) => {
          const stringContent =
            typeof newContent === "object"
              ? JSON.stringify(newContent)
              : newContent;
          setEditorContent(stringContent);
        }}
        placeholder="Enter subsection content..."
        standards={standards}
      />

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !number}
          className="px-4 py-2 bg-[#355189] text-white rounded-lg text-sm font-semibold hover:bg-[#1B2B4B] disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Subsection
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
