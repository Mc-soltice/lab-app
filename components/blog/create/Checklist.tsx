// components/blog/create/Checklist.tsx
"use client";

import { CheckCircle2, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useState } from "react";

interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  isMobile?: boolean;
}

export default function Checklist({
  items,
  completedCount,
  totalCount,
  progressPercentage,
  isMobile = false,
}: ChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isMobile) {
    return (
      <div
        className="rounded-xl border"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <CheckCircle2
              className="w-4 h-4"
              style={{ color: "var(--text-primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {completedCount}/{totalCount}
            </span>
          </div>
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--border)" }}
          >
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div
            className="px-4 pb-3 pt-2 border-t space-y-2"
            style={{ borderColor: "var(--border)" }}
          >
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-2 py-1">
                {item.done ? (
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: "var(--accent)" }}
                  />
                ) : (
                  <Circle
                    className="w-4 h-4"
                    style={{ color: "var(--border)" }}
                  />
                )}
                <span
                  className="text-sm"
                  style={{
                    color: item.done
                      ? "var(--text-tertiary)"
                      : "var(--text-secondary)",
                    textDecoration: item.done ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="border rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="w-5 h-5"
              style={{ color: "var(--accent)" }}
            />
            <h4
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Checklist
            </h4>
          </div>
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: "var(--accent)",
            }}
          />
        </div>
      </div>
      <div className="p-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 py-1.5 px-2 rounded-xl transition-colors"
            style={{
              backgroundColor: item.done ? "var(--bg-tertiary)" : "transparent",
            }}
          >
            {item.done ? (
              <CheckCircle2
                className="w-4 h-4"
                style={{ color: "var(--accent)" }}
              />
            ) : (
              <Circle className="w-4 h-4" style={{ color: "var(--border)" }} />
            )}
            <span
              className="text-sm"
              style={{
                color: item.done
                  ? "var(--text-tertiary)"
                  : "var(--text-secondary)",
                textDecoration: item.done ? "line-through" : "none",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
