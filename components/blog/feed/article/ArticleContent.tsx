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
          <strong key={`${part}-${index}`} className="font-semibold">
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
    const text =
      typeof content === "string" ? content : content ? String(content) : "";
    const lines = text.split("\n");
    const elements: Array<React.ReactNode> = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length === 0) return;

      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="mb-4 ml-6 list-disc space-y-2"
        >
          {listItems.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {renderInlineMarkdown(item)}
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
            className="text-2xl font-bold mt-8 mb-4"
            style={{ color: "var(--text-primary)" }}
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
            className="text-xl font-semibold mt-6 mb-3"
            style={{ color: "var(--text-primary)" }}
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
            className="border-l-4 pl-4 my-4 italic"
            style={{
              borderColor: "var(--accent)",
              color: "var(--text-secondary)",
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
        elements.push(<div key={`sp-${index}`} className="h-4" />);
        return;
      }

      elements.push(
        <p
          key={`p-${index}`}
          className="mb-4 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
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
      className="frosted-glass rounded-3xl p-6 md:p-12"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="markdown-body text-sm md:text-base leading-relaxed">
        {renderContent(activePost.content)}
      </div>

      {activePost.tags && activePost.tags.length > 0 && (
        <div
          className="mt-12 pt-8 border-t flex flex-wrap gap-2"
          style={{ borderColor: "var(--border)" }}
        >
          {activePost.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 border rounded-lg text-xs cursor-pointer font-mono uppercase tracking-widest transition-colors"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border)",
                color: "var(--text-tertiary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-tertiary)";
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
