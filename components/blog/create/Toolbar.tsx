// components/blog/create/Toolbar.tsx
"use client";

import { Bold, Italic, Link as LinkIcon, List } from "lucide-react";

interface ToolbarProps {
  onInsertText: (before: string, after?: string) => void;
}

export default function Toolbar({ onInsertText }: ToolbarProps) {
  const tools = [
    { icon: Bold, label: "Gras", action: () => onInsertText("**", "**") },
    { icon: Italic, label: "Italique", action: () => onInsertText("*", "*") },
    { icon: List, label: "Liste", action: () => onInsertText("- ") },
    {
      icon: LinkIcon,
      label: "Lien",
      action: () => onInsertText("[", "](url)"),
    },
  ];

  return (
    <div
      className="border-b p-2 sm:p-3 flex flex-wrap gap-0.5 sm:gap-1"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={tool.action}
          className="p-1.5 sm:p-2 rounded-xl transition"
          style={{ background: "transparent" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-tertiary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          aria-label={tool.label}
        >
          <tool.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      ))}
      <div
        className="w-px h-5 sm:h-6 mx-0.5 sm:mx-1"
        style={{ background: "var(--border)" }}
      />
      <button
        type="button"
        onClick={() => onInsertText("# ")}
        className="p-1.5 sm:p-2 rounded-xl transition text-xs sm:text-sm font-bold"
        style={{ background: "transparent" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-tertiary)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => onInsertText("## ")}
        className="p-1.5 sm:p-2 rounded-xl transition text-xs sm:text-sm font-bold"
        style={{ background: "transparent" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-tertiary)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => onInsertText("### ")}
        className="p-1.5 sm:p-2 rounded-xl transition text-xs sm:text-sm font-bold"
        style={{ background: "transparent" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-tertiary)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        H3
      </button>
    </div>
  );
}
