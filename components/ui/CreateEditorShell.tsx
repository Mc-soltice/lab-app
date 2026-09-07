"use client";

import { BookOpen, PenSquare, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface CreateEditorShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  sidebar?: ReactNode;
  summaryItems?: Array<{ label: string; value: ReactNode }>;
  flush?: boolean;
}

export default function CreateEditorShell({
  title,
  subtitle,
  children,
  sidebar,
  summaryItems,
  flush = false,
}: CreateEditorShellProps) {
  return (
    <div
      className={
        flush ? "w-full" : "mx-auto w-full max-w-7xl px-2 py-4 sm:px-0 lg:px-10 lg:py-6"
      }
    >
      <div
        className={flush ? "mb-6" : "mb-6 rounded-3xl border p-5 shadow-sm sm:p-6"}
        style={
          flush
            ? undefined
            : {
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-sm)",
              }
        }
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-tertiary)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              Création de contenu
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border)",
            }}
          >
            <PenSquare className="h-4 w-4" style={{ color: "var(--accent)" }} />
            Mode éditeur
            <BookOpen className="h-4 w-4" style={{ color: "var(--accent)" }} />
          </div>
        </div>
      </div>

      <div className={sidebar ? "grid gap-6 xl:grid-cols-[1.4fr_0.7fr]" : "block"}>
        <div>{children}</div>
        {sidebar ? (
          <div className="space-y-4">
            {sidebar}
            {summaryItems && summaryItems.length > 0 ? (
              <div
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                <h4
                  className="mb-3 text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Résumé
                </h4>
                <div className="space-y-2 text-sm">
                  {summaryItems.map((item) => (
                    <div className="flex justify-between gap-4" key={item.label}>
                      <span style={{ color: "var(--text-tertiary)" }}>
                        {item.label}
                      </span>
                      <span
                        className="text-right"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
