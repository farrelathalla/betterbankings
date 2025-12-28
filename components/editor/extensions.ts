import { Mark, mergeAttributes } from "@tiptap/core";

// Custom Tooltip Mark - for adding definitions/explanations to text
export const TooltipMark = Mark.create({
  name: "tooltip",

  addAttributes() {
    return {
      definition: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-definition"),
        renderHTML: (attributes) => {
          if (!attributes.definition) {
            return {};
          }
          return {
            "data-definition": attributes.definition,
            class: "tooltip-text",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-definition]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class:
          "tooltip-text border-b border-dashed border-[#355189] cursor-help",
      }),
      0,
    ];
  },
});

// Custom Reference Mark - for linking to other Basel sections
export const ReferenceMark = Mark.create({
  name: "reference",

  addAttributes() {
    return {
      standardCode: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-standard"),
        renderHTML: (attributes) => ({
          "data-standard": attributes.standardCode,
        }),
      },
      chapterCode: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-chapter"),
        renderHTML: (attributes) => ({
          "data-chapter": attributes.chapterCode,
        }),
      },
      sectionId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-section"),
        renderHTML: (attributes) => ({
          "data-section": attributes.sectionId,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-standard]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class:
          "reference-link text-[#355189] font-medium cursor-pointer hover:underline",
      }),
      0,
    ];
  },
});
