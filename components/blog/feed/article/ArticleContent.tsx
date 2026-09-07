// components/blog/article/ArticleContent.tsx
"use client";

import { UIArticlePost } from "./ArticleView";

interface ArticleContentProps {
  activePost: UIArticlePost;
}

export default function ArticleContent({ activePost }: ArticleContentProps) {
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

    return parts.map((part, index) => {
      if (/^\*\*.+\*\*$/.test(part)) {
        return (
          <strong
            key={`${part}-${index}`}
            className="font-semibold"
            style={{ color: "var(--ra-ink)" }}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (/^\*.+\*$/.test(part)) {
        return (
          <em key={`${part}-${index}`} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const renderContent = (content?: string) => {
    const text = typeof content === "string" ? content : content ? String(content) : "";
    const lines = text.split("\n");
    const elements: Array<React.ReactNode> = [];
    let listItems: string[] = [];
    let paragraphCount = 0;

    const flushList = () => {
      if (listItems.length === 0) return;

      elements.push(
        <ul key={`list-${elements.length}`} className="mb-5 ml-5 space-y-2">
          {listItems.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="leading-relaxed flex gap-2"
              style={{ color: "var(--ra-ink-soft)" }}
            >
              <span
                className="mt-2 w-1 h-1 rounded-full shrink-0"
                style={{ backgroundColor: "var(--ra-amber)" }}
              />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    };

    lines.forEach((line, index) => {
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2
            key={`h2-${index}`}
            className="font-serif text-2xl mt-10 mb-4 pb-2 border-b"
            style={{ color: "var(--ra-ink)", borderColor: "var(--ra-rule)" }}
          >
            {renderInlineMarkdown(line.slice(3))}
          </h2>,
        );
        return;
      }

      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3
            key={`h3-${index}`}
            className="font-mono text-xs uppercase tracking-widest font-bold mt-8 mb-3"
            style={{ color: "var(--ra-amber)" }}
          >
            {renderInlineMarkdown(line.slice(4))}
          </h3>,
        );
        return;
      }

      if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="pl-5 my-6 italic font-serif text-lg leading-relaxed"
            style={{
              borderLeft: "3px double var(--ra-bordeaux)",
              color: "var(--ra-ink-soft)",
            }}
          >
            {renderInlineMarkdown(line.slice(2))}
          </blockquote>,
        );
        return;
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        listItems.push(line.slice(2).trim());
        return;
      }

      flushList();

      if (!line.trim()) {
        elements.push(<div key={`sp-${index}`} className="h-2" />);
        return;
      }

      paragraphCount += 1;
      const isFirst = paragraphCount === 1;

      elements.push(
        <p
          key={`p-${index}`}
          className={`mb-4 leading-[1.8] font-serif text-[15px] md:text-base ${
            isFirst
              ? "first-letter:text-5xl first-letter:font-semibold first-letter:mr-1 first-letter:float-left first-letter:leading-[0.85] first-letter:text-(--ra-bordeaux)"
              : ""
          }`}
          style={{ color: "var(--ra-ink-soft)" }}
        >
          {renderInlineMarkdown(line)}
        </p>,
      );
    });

    flushList();
    return elements;
  };

  return (
    <div
      id="article-markdown-body"
      className="rounded-sm border p-6 md:p-12"
      style={{ backgroundColor: "var(--ra-paper)", borderColor: "var(--ra-rule)" }}
    >
      <div className="markdown-body">{renderContent(activePost.content)}</div>

      {activePost.tags && activePost.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t" style={{ borderColor: "var(--ra-rule)" }}>
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-3"
            style={{ color: "var(--ra-ink-soft)" }}
          >
            Mots-clés indexés
          </p>
          <div className="flex flex-wrap gap-2">
            {activePost.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 border text-[11px] cursor-pointer font-mono uppercase tracking-wider transition-colors"
                style={{
                  borderColor: "var(--ra-rule-strong)",
                  color: "var(--ra-ink-soft)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--ra-amber)";
                  e.currentTarget.style.borderColor = "var(--ra-amber)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--ra-ink-soft)";
                  e.currentTarget.style.borderColor = "var(--ra-rule-strong)";
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
