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
  const postComments = comments.filter((c) => c.postId === postId && c.approved);

  return (
    <div
      id="comment-form-anchor"
      className="rounded-sm border p-6 md:p-10 flex flex-col gap-8"
      style={{ backgroundColor: "var(--ra-paper)", borderColor: "var(--ra-rule)" }}
    >
      <div
        className="flex items-center justify-between border-b pb-4"
        style={{ borderColor: "var(--ra-rule)" }}
      >
        <span
          className="text-sm font-serif font-semibold flex items-center gap-2"
          style={{ color: "var(--ra-ink)" }}
        >
          <MessageCircle className="w-4 h-4" style={{ color: "var(--ra-amber)" }} />
          Registre des annotations
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 border rounded-sm"
            style={{
              borderColor: "var(--ra-rule-strong)",
              color: "var(--ra-ink-soft)",
            }}
          >
            {postComments.length}
          </span>
        </span>
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: "var(--ra-ink-soft)" }}
        >
          Modéré en temps réel
        </span>
      </div>

      {/* Entrées du registre */}
      <div className="flex flex-col">
        {postComments.length === 0 ? (
          <p
            className="text-xs py-8 text-center font-mono uppercase tracking-wider"
            style={{ color: "var(--ra-ink-soft)" }}
          >
            Registre vide — soyez la première entrée
          </p>
        ) : (
          postComments.map((comment, i) => (
            <div
              key={comment.id}
              className="flex gap-4 items-start py-5 border-b last:border-0"
              style={{ borderColor: "var(--ra-rule)" }}
            >
              <span
                className="font-mono text-[10px] pt-1 w-6 shrink-0 text-right"
                style={{ color: "var(--ra-amber)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                className="relative w-9 h-9 overflow-hidden border shrink-0"
                style={{ borderColor: "var(--ra-rule-strong)" }}
              >
                <ProductImage
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className="text-xs font-serif font-semibold"
                    style={{ color: "var(--ra-ink)" }}
                  >
                    {comment.authorName}
                  </span>
                  <span
                    className="text-[9px] font-mono"
                    style={{ color: "var(--ra-ink-soft)" }}
                  >
                    {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed mt-1.5 whitespace-pre-line wrap-break-word font-serif"
                  style={{ color: "var(--ra-ink-soft)" }}
                >
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fiche d'inscription */}
      <form
        onSubmit={handleCommentFormSubmit}
        className="pt-6 border-t flex flex-col gap-4"
        style={{ borderColor: "var(--ra-rule)" }}
      >
        <h4
          className="text-[10px] font-mono font-bold uppercase tracking-widest"
          style={{ color: "var(--ra-amber)" }}
        >
          Fiche d'inscription — nouvelle entrée
        </h4>

        {activeProfile ? (
          <div
            className="flex items-center justify-between p-3.5 border"
            style={{
              backgroundColor: "var(--ra-paper-alt)",
              borderColor: "var(--ra-rule)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="relative w-9 h-9 overflow-hidden border shrink-0"
                style={{ borderColor: "var(--ra-green)" }}
              >
                <ProductImage
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div>
                <span
                  className="text-xs font-serif font-semibold block"
                  style={{ color: "var(--ra-ink)" }}
                >
                  {activeProfile.name}
                </span>
                <span
                  className="text-[9px] font-mono uppercase"
                  style={{ color: "var(--ra-ink-soft)" }}
                >
                  Session active • {activeProfile.roleLabel}
                </span>
              </div>
            </div>
            <span
              className="text-[9px] font-mono border px-2 py-0.5 uppercase font-semibold"
              style={{ borderColor: "var(--ra-green)", color: "var(--ra-green)" }}
            >
              Identifié
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="text-[10px] font-mono uppercase font-semibold"
                style={{ color: "var(--ra-ink-soft)" }}
              >
                Pseudonyme
              </label>
              <input
                type="text"
                placeholder="ex. Marc Lefèvre"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="text-xs p-3 focus:outline-none font-serif"
                style={{
                  backgroundColor: "var(--ra-paper-alt)",
                  border: "1px solid var(--ra-rule)",
                  color: "var(--ra-ink)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--ra-amber)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--ra-rule)";
                }}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-[10px] font-mono uppercase font-semibold"
                style={{ color: "var(--ra-ink-soft)" }}
              >
                Avatar généré
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="relative w-9 h-9 overflow-hidden border shrink-0"
                  style={{
                    backgroundColor: "var(--ra-paper-alt)",
                    borderColor: "var(--ra-rule)",
                  }}
                >
                  <ProductImage
                    src={`https://ui-avatars.com/api/?background=204331&color=F4EEDF&name=${commentAuthor ? commentAuthor[0] : "U"}`}
                    alt="Aperçu généré"
                    fill
                    className="object-cover"
                  />
                </div>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "var(--ra-ink-soft)" }}
                >
                  Généré à la saisie
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-mono uppercase font-semibold"
            style={{ color: "var(--ra-ink-soft)" }}
          >
            Message
          </label>
          <textarea
            rows={3}
            placeholder="Qu'avez-vous pensé de ces perspectives ?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-xs p-3 resize-none focus:outline-none font-serif"
            style={{
              backgroundColor: "var(--ra-paper-alt)",
              border: "1px solid var(--ra-rule)",
              color: "var(--ra-ink)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--ra-amber)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--ra-rule)";
            }}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            id="comment-submit-btn"
            type="submit"
            disabled={isSubmittingComment}
            className="px-5 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest border-2 transition-transform hover:-rotate-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: "var(--ra-bordeaux)",
              color: "var(--ra-bordeaux)",
              backgroundColor: "rgba(124,43,50,0.06)",
            }}
          >
            {isSubmittingComment ? (
              <div
                className="w-3 h-3 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "var(--ra-bordeaux)",
                  borderTopColor: "transparent",
                }}
              />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Enregistrer l'entrée
          </button>
        </div>
      </form>
    </div>
  );
}
