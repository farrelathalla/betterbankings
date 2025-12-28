"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TooltipMark, ReferenceMark } from "./extensions";
import { useState, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  MessageSquare,
  Bookmark,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  standards?: Array<{
    id: string;
    code: string;
    name: string;
    chapters: Array<{ id: string; code: string; title: string }>;
  }>;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  standards = [],
}: RichTextEditorProps) {
  const [showTooltipModal, setShowTooltipModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [tooltipDefinition, setTooltipDefinition] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [subsectionNumber, setSubsectionNumber] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      TooltipMark,
      ReferenceMark,
    ],
    content: content || "",
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as unknown as string);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[150px] px-4 py-3 focus:outline-none",
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content) {
      try {
        const parsed =
          typeof content === "string" ? JSON.parse(content) : content;
        if (parsed.type === "doc") {
          editor.commands.setContent(parsed);
        }
      } catch {
        // If not JSON, treat as plain text
        if (typeof content === "string" && content.trim()) {
          editor.commands.setContent(`<p>${content}</p>`);
        }
      }
    }
  }, []);

  const addTooltip = useCallback(() => {
    if (!editor || !tooltipDefinition.trim()) return;

    editor
      .chain()
      .focus()
      .setMark("tooltip", { definition: tooltipDefinition })
      .run();

    setTooltipDefinition("");
    setShowTooltipModal(false);
  }, [editor, tooltipDefinition]);

  const addReference = useCallback(() => {
    if (!editor || !selectedStandard) return;

    editor
      .chain()
      .focus()
      .setMark("reference", {
        standardCode: selectedStandard,
        chapterCode: selectedChapter || null,
        subsectionNumber: subsectionNumber || null,
      })
      .run();

    setSelectedStandard("");
    setSelectedChapter("");
    setSubsectionNumber("");
    setShowReferenceModal(false);
  }, [editor, selectedStandard, selectedChapter, subsectionNumber]);

  const removeTooltip = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetMark("tooltip").run();
  }, [editor]);

  const removeReference = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetMark("reference").run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 text-gray-400">
        Loading editor...
      </div>
    );
  }

  const selectedChapters =
    standards.find((s) => s.code === selectedStandard)?.chapters || [];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Basic formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Custom marks */}
        <ToolbarButton
          onClick={() => setShowTooltipModal(true)}
          active={editor.isActive("tooltip")}
          title="Add Tooltip Definition"
          className="text-purple-600"
        >
          <MessageSquare className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => setShowReferenceModal(true)}
          active={editor.isActive("reference")}
          title="Add Basel Reference"
          className="text-blue-600"
        >
          <Bookmark className="w-4 h-4" />
        </ToolbarButton>

        {/* Remove marks */}
        {editor.isActive("tooltip") && (
          <ToolbarButton
            onClick={removeTooltip}
            title="Remove Tooltip"
            className="text-red-500"
          >
            <X className="w-4 h-4" />
          </ToolbarButton>
        )}

        {editor.isActive("reference") && (
          <ToolbarButton
            onClick={removeReference}
            title="Remove Reference"
            className="text-red-500"
          >
            <X className="w-4 h-4" />
          </ToolbarButton>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Tooltip Modal */}
      {showTooltipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-[#14213D] mb-4">
              Add Tooltip Definition
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              This definition will appear when users hover over the selected
              text.
            </p>
            <textarea
              value={tooltipDefinition}
              onChange={(e) => setTooltipDefinition(e.target.value)}
              placeholder="Enter the definition or explanation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={addTooltip}
                disabled={!tooltipDefinition.trim()}
                className="flex-1 py-2 bg-[#355189] text-white rounded-lg font-semibold hover:bg-[#1B2B4B] disabled:opacity-50"
              >
                Add Tooltip
              </button>
              <button
                onClick={() => {
                  setShowTooltipModal(false);
                  setTooltipDefinition("");
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-[#14213D] mb-4">
              Add Basel Reference
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Link to another Basel Framework section.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#14213D] mb-1">
                  Standard
                </label>
                <select
                  value={selectedStandard}
                  onChange={(e) => {
                    setSelectedStandard(e.target.value);
                    setSelectedChapter("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                >
                  <option value="">Select a standard...</option>
                  {standards.map((std) => (
                    <option key={std.id} value={std.code}>
                      {std.code} - {std.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedChapters.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#14213D] mb-1">
                    Chapter (optional)
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                  >
                    <option value="">Any chapter</option>
                    {selectedChapters.map((ch) => (
                      <option key={ch.id} value={ch.code}>
                        {selectedStandard}
                        {ch.code} - {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedChapter && (
                <div>
                  <label className="block text-sm font-semibold text-[#14213D] mb-1">
                    Subsection Number (optional)
                  </label>
                  <input
                    type="text"
                    value={subsectionNumber}
                    onChange={(e) => setSubsectionNumber(e.target.value)}
                    placeholder="e.g., 1, 2, 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355189] outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Links to {selectedStandard}
                    {selectedChapter}.{subsectionNumber || "X"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={addReference}
                disabled={!selectedStandard}
                className="flex-1 py-2 bg-[#355189] text-white rounded-lg font-semibold hover:bg-[#1B2B4B] disabled:opacity-50"
              >
                Add Reference
              </button>
              <button
                onClick={() => {
                  setShowReferenceModal(false);
                  setSelectedStandard("");
                  setSelectedChapter("");
                  setSubsectionNumber("");
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Toolbar button component
function ToolbarButton({
  onClick,
  active,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        active ? "bg-gray-200 text-[#14213D]" : "text-gray-600"
      } ${className}`}
    >
      {children}
    </button>
  );
}
