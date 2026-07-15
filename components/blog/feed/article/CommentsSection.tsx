// components/blog/feed/article/CommentsSection.tsx
"use client";

import ProductImage from "@/components/ProductImage";
import { MessageCircle, Send } from "lucide-react";
import React from "react";
import { UIComment } from "./ArticleView";

interface CommentsSectionProps {
  comments: UIComment[];
  postId: string;
  commentAuthor: string;
  setCommentAuthor: (a: string) => void;
  commentText: string;
  setCommentText: (t: string) => void;
  isSubmittingComment: boolean;
  activeProfile?: any;
  handleCommentFormSubmit: (e: React.FormEvent) => void;
}

export default function CommentsSection({
  comments,
  postId,
  commentAuthor,
  setCommentAuthor,
  commentText,
  setCommentText,
  isSubmittingComment,
  activeProfile,
  handleCommentFormSubmit,
}: CommentsSectionProps) {
  const postComments = comments.filter(
    (c) => c.postId === postId && c.approved,
  );

  return (
    <div
      id="comment-form-anchor"
      className="frosted-glass rounded-3xl p-6 md:p-8 flex flex-col gap-6"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div
        className="flex items-center justify-between border-b pb-4"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-md font-bold font-display uppercase tracking-wider flex items-center gap-2">
          <MessageCircle
            className="w-5 h-5"
            style={{ color: "var(--accent)" }}
          />
          <span style={{ color: "var(--text-primary)" }}>
            {postComments.length} Commentaires
          </span>
        </span>
        <span
          className="text-[10px] font-mono uppercase"
          style={{ color: "var(--text-tertiary)" }}
        >
          Les messages sont modérés en temps réel
        </span>
      </div>

      {/* Comments list */}
      <div className="flex flex-col gap-6">
        {postComments.length === 0 ? (
          <p
            className="text-xs py-8 text-center font-mono uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            Soyez le premier à réagir à cet article !
          </p>
        ) : (
          postComments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 items-start border-b pb-5 last:border-0 last:pb-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden border shrink-0"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                <ProductImage
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {comment.authorName}
                  </span>
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--text-tertiary)" }}
                  ></span>
                  <span
                    className="text-[9px] font-mono mt-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed mt-1.5 whitespace-pre-line wrap-break-word"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form
        onSubmit={handleCommentFormSubmit}
        className="mt-4 pt-6 border-t flex flex-col gap-4"
        style={{ borderColor: "var(--border)" }}
      >
        <h4
          className="text-xs font-bold font-display uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          Participer à la conversation
        </h4>

        {activeProfile ? (
          <div
            className="flex items-center justify-between p-3.5 border rounded-xl"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="relative w-9 h-9 rounded-full overflow-hidden border p-0.5 shrink-0"
                style={{ borderColor: "var(--accent)" }}
              >
                <ProductImage
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  fill
                  sizes="36px"
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <span
                  className="text-xs font-bold block"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activeProfile.name}
                </span>
                <span
                  className="text-[9px] font-mono uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Session Active • {activeProfile.roleLabel}
                </span>
              </div>
            </div>
            <span
              className="text-[8.5px] font-mono border px-2 py-0.5 rounded uppercase font-semibold"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              Identifié
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="text-[10px] font-mono uppercase font-semibold mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                votre pseudonyme
              </label>
              <input
                type="text"
                placeholder="e.g. Marc Lefèvre"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="text-xs rounded-lg p-3 focus:outline-none"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-[10px] font-mono uppercase font-semibold mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                avatar graine (généré automatiquement)
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="relative w-9 h-9 rounded-full overflow-hidden border shrink-0"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                  }}
                >
                  <ProductImage
                    src={`https://ui-avatars.com/api/?background=6366f1&color=fff&name=${commentAuthor ? commentAuthor[0] : "U"}`}
                    alt="Generated Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {"L'avatar se génère à la saisie"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-mono uppercase font-semibold mb-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            votre message
          </label>
          <textarea
            rows={3}
            placeholder="Qu'avez-vous pensé de ces perspectives ?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-xs rounded-lg p-3 resize-none focus:outline-none"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            id="comment-submit-btn"
            type="submit"
            disabled={isSubmittingComment}
            className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
          >
            {isSubmittingComment ? (
              <div className="w-3 h-3 border-2 border-t-black border-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Envoyer le commentaire</span>
          </button>
        </div>
      </form>
    </div>
  );
}
