// app/post/page.tsx
"use client";

import { usePost } from "@/hooks/blog/post/usePost";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Checklist from "@/components/blog/create/Checklist";
import TagInput from "@/components/blog/create/TagInput";
import Toolbar from "@/components/blog/create/Toolbar";
import CoverImageUpload from "@/components/ui/CoverImageUpload";
import SuccessModal from "@/components/ui/SuccessModal";
import { useImageUpload } from "@/hooks/blog/useImageUpload";

export default function CreatePostPage() {
  const router = useRouter();

  // Utiliser notre hook personnalisé
  const {
    formData,
    updateField,
    handleSubmit,
    isSubmitting,
    categories,
    tags,
    isValid,
    errors,
    resetForm,
    hasAttemptedSubmit,
  } = usePost({
    onSuccess: (post) => {
      console.log("Post créé avec succès:", post);
      setShowSuccessModal(true);
      window.setTimeout(() => {
        router.push("/home");
      }, 1600);
    },
    onError: (error) => {
      console.error("Erreur lors de la création du post:", error);
    },
  });

  // États UI
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [excerptFocused, setExcerptFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isMobile, setIsMobile] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const {
    uploadImage,
    deleteImage,
    isUploading,
    progress,
    error: uploadError,
  } = useImageUpload();
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Gestionnaire d'upload
  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      updateField("cover_image", imageUrl);
    }
  };

  // Gestionnaire de suppression
  const handleImageRemove = async () => {
    updateField("cover_image", "");
  };

  const handleUrlChange = (url: string) => {
    updateField("cover_image", url);
  };

  // Insertion de texte dans l'éditeur
  const insertText = (before: string, after: string = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || "";
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      selectedText +
      after +
      text.substring(end);
    updateField("content", newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Gestion des tags avec création automatique
  const handleTagAdd = async (tagName: string) => {
    if (!tagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const newTag = await tags.createAndSelectTag(tagName.trim());

      if (newTag) {
        // Ajouter le tag à la sélection
        const newTagIds = [...(formData.tag_ids || []), newTag.id];
        updateField("tag_ids", newTagIds);
        toast.success(`Tag "${tagName}" ajouté`);
      } else {
        toast.error(`Impossible d'ajouter le tag "${tagName}"`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
      toast.error(`Erreur lors de l'ajout du tag "${tagName}"`);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleTagRemove = (tagName: string) => {
    const tag = tags.getTagByName(tagName);
    if (tag) {
      const newTagIds = (formData.tag_ids || []).filter((id) => id !== tag.id);
      updateField("tag_ids", newTagIds);
      toast.success(`Tag "${tagName}" retiré`);
    }
  };

  // Gestion des catégories avec création automatique
  const handleCategoryAdd = async (categoryName: string) => {
    if (!categoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const newCategory = await categories.createAndSelectCategory(
        categoryName.trim(),
      );

      if (newCategory) {
        updateField("category_id", String(newCategory.id));
        toast.success(`Catégorie "${categoryName}" ajoutée`);
      } else {
        toast.error(`Impossible d'ajouter la catégorie "${categoryName}"`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast.error(`Erreur lors de l'ajout de la catégorie "${categoryName}"`);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Gestion de la suppression de la catégorie
  const handleCategoryRemove = (categoryName: string) => {
    // On vérifie que la catégorie actuelle correspond au nom
    const currentCategory = categories.getCategoryById(formData.category_id);
    if (currentCategory?.name === categoryName) {
      updateField("category_id", "");
      toast.success(`Catégorie "${categoryName}" retirée`);
    }
  };

  // Checklist items
  const checklistItems = [
    { key: "title", label: "Titre défini", done: !!formData.title?.trim() },
    {
      key: "content",
      label: "Contenu rédigé",
      done: !!formData.content?.trim(),
    },
    {
      key: "excerpt",
      label: "Extrait ajouté",
      done: !!formData.excerpt?.trim(),
    },
    {
      key: "cover",
      label: "Image de couverture",
      done: !!formData.cover_image,
    },
    {
      key: "category",
      label: "Catégorie sélectionnée",
      done: Boolean(formData.category_id),
    },
    {
      key: "tags",
      label: "Tag(s) sélectionnés",
      done: (formData.tag_ids?.length ?? 0) > 0,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.done).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Prévisualisation
  const previewContent = (formData.content || "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  // Récupérer le nom de la catégorie sélectionnée
  const selectedCategoryName = formData.category_id
    ? categories.getCategoryName(formData.category_id)
    : "";

  return (
    <ProtectedRoute fallback={<div className="min-h-screen" />}>
      <main style={{ backgroundColor: "var(--bg-primary)" }}>
        <SuccessModal
          isOpen={showSuccessModal}
          description="Votre article a bien été créé et vous allez être redirigé vers l’accueil."
        />
        <div className="w-full mx-auto">
          {/* CHECKLIST MOBILE */}
          {isMobile && (
            <div
              className="sticky top-0 z-10 -mx-4 px-4 py-3 border-b"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
              }}
            >
              <Checklist
                items={checklistItems}
                completedCount={completedCount}
                totalCount={totalCount}
                progressPercentage={progressPercentage}
                isMobile={true}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-2 lg:mt-3">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Colonne principale */}
              <div className="flex-1 order-2 lg:order-1 space-y-6">
                {/* Titre */}
                <div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                    className="w-full rounded-xl px-2 py-4 text-2xl sm:text-3xl font-light placeholder:font-light outline-none transition-all duration-200"
                    placeholder="Titre de l'article..."
                    onFocus={() => setIsTitleFocused(true)}
                    onBlur={() => setIsTitleFocused(false)}
                    style={{
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      borderWidth: isTitleFocused ? "2px" : "1px",
                    }}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm" style={{ color: "#DC2626" }}>
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Éditeur */}
                <div
                  className="border rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    borderColor: "var(--border)",
                    borderWidth: editorFocused ? "2px" : "1px",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-3 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Toolbar onInsertText={insertText} />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab("write")}
                        className="px-3 py-1.5 text-xs rounded transition-colors"
                        style={{
                          color:
                            activeTab === "write"
                              ? "var(--text-primary)"
                              : "var(--text-tertiary)",
                          backgroundColor:
                            activeTab === "write"
                              ? "var(--bg-tertiary)"
                              : "transparent",
                        }}
                      >
                        Écrire
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className="px-3 py-1.5 text-xs rounded transition-colors"
                        style={{
                          color:
                            activeTab === "preview"
                              ? "var(--text-primary)"
                              : "var(--text-tertiary)",
                          backgroundColor:
                            activeTab === "preview"
                              ? "var(--bg-tertiary)"
                              : "transparent",
                        }}
                      >
                        Aperçu
                      </button>
                    </div>
                  </div>

                  {activeTab === "write" ? (
                    <textarea
                      ref={contentTextareaRef}
                      value={formData.content}
                      onChange={(e) => updateField("content", e.target.value)}
                      required
                      rows={14}
                      className="w-full px-4 py-4 border-none focus:ring-0 font-mono text-sm resize-none outline-none"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Commencez à écrire..."
                      onFocus={() => setEditorFocused(true)}
                      onBlur={() => setEditorFocused(false)}
                    />
                  ) : (
                    <div
                      className="p-6 prose prose-sm max-w-none"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {previewContent ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                      ) : (
                        <p style={{ color: "var(--text-tertiary)" }}>
                          Rien à prévisualiser. Commencez à écrire !
                        </p>
                      )}
                    </div>
                  )}
                  {errors.content && (
                    <p
                      className="px-4 pb-2 text-sm"
                      style={{ color: "#DC2626" }}
                    >
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* Extrait */}
                <div
                  className="border rounded-xl p-4 transition-all duration-200"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Extrait
                  </label>
                  <textarea
                    value={formData.excerpt || ""}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-xl resize-none focus:ring-0 outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                      borderWidth: excerptFocused ? "2px" : "1px",
                    }}
                    onFocus={() => setExcerptFocused(true)}
                    onBlur={() => setExcerptFocused(false)}
                    placeholder="Un résumé captivant..."
                  />
                  <div className="flex justify-between mt-2">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {formData.excerpt?.length || 0}/160 caractères
                    </p>
                    {errors.excerpt && (
                      <p className="text-xs" style={{ color: "#DC2626" }}>
                        {errors.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image de couverture */}
                <div
                  className="border p-4 rounded-xl"
                  style={{ borderColor: "var(--border)" }}
                >
                  <CoverImageUpload
                    cover_image={formData.cover_image || ""}
                    isUploading={isUploading}
                    uploadProgress={progress}
                    uploadError={uploadError}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    onUrlChange={handleUrlChange}
                    onDeleteImage={deleteImage}
                    maxSize={5}
                  />
                </div>

                {/* Catégories et Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TagInput
                    label="Catégorie"
                    items={selectedCategoryName ? [selectedCategoryName] : []}
                    placeholder="Ajouter une catégorie..."
                    onAdd={handleCategoryAdd}
                    onRemove={handleCategoryRemove}
                    availableItems={categories.categoryNames}
                    tagColor="blue"
                    disabled={isCreatingCategory || categories.isCreating}
                    isCreating={isCreatingCategory || categories.isCreating}
                    maxTags={1}
                  />

                  {/* Tags */}
                  <TagInput
                    label="Tags"
                    items={tags.tagNames.filter((name) =>
                      formData.tag_ids?.some(
                        (id) => tags.getTagByName(name)?.id === id,
                      ),
                    )}
                    placeholder="Ajouter un tag..."
                    onAdd={handleTagAdd}
                    onRemove={handleTagRemove}
                    availableItems={tags.tagNames}
                    tagColor="blue"
                    disabled={isCreatingTag || tags.isCreating}
                    isCreating={isCreatingTag || tags.isCreating}
                    maxTags={10}
                  />
                </div>
                <div className="w-full flex flex-row gap-2">
                  {/* Bloc Statut avec toggle - Prend 50% de la largeur */}
                  <div className="flex-1">
                    <div
                      className="border rounded-xl p-3 transition-all duration-300 h-full flex items-center"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p
                            className="text-sm font-medium transition-all duration-300"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {formData.published
                              ? "Visible par tous"
                              : "Brouillon"}
                          </p>
                          <p
                            className="text-xs transition-all duration-300"
                            style={{
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {formData.published ? "● Publié" : "● Non publié"}
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.published}
                            onChange={(e) =>
                              updateField("published", e.target.checked)
                            }
                          />
                          <div
                            className={`
              relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out
              ${formData.published ? "bg-(--accent)" : "bg-(--border)"}
              after:content-[''] after:absolute after:top-0.5 after:left-0.5
              after:bg-white after:rounded-full after:h-5 after:w-5 
              after:transition-all after:duration-300 after:ease-in-out
              ${
                formData.published
                  ? "after:translate-x-5 after:shadow-md"
                  : "after:translate-x-0 after:shadow-sm"
              }
              hover:scale-105
            `}
                            style={{
                              backgroundColor: formData.published
                                ? "var(--accent)"
                                : "var(--border)",
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit - Prend 50% de la largeur */}
                  <div className="flex-1">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !isValid ||
                        isCreatingTag ||
                        isCreatingCategory ||
                        tags.isCreating ||
                        categories.isCreating
                      }
                      className="w-full py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-full"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !isSubmitting &&
                          !isCreatingTag &&
                          !isCreatingCategory
                        ) {
                          e.currentTarget.style.opacity = "0.85";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {formData.published
                            ? "Publication en cours..."
                            : "Enregistrement en cours..."}
                        </>
                      ) : isCreatingCategory ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création de la catégorie...
                        </>
                      ) : isCreatingTag || tags.isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création des tags...
                        </>
                      ) : formData.published ? (
                        "Publier l'article"
                      ) : (
                        "Enregistrer comme brouillon"
                      )}
                    </button>
                    {errors.submit && (
                      <p
                        className="mt-2 text-sm text-center"
                        style={{ color: "#DC2626" }}
                      >
                        {errors.submit}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              {!isMobile && (
                <aside className="order-1 lg:order-2 w-full lg:w-72 xl:w-80 shrink-0">
                  <div className="lg:sticky lg:top-24 space-y-4">
                    <Checklist
                      items={checklistItems}
                      completedCount={completedCount}
                      totalCount={totalCount}
                      progressPercentage={progressPercentage}
                      isMobile={false}
                    />

                    {/* Résumé des sélections */}
                    <div
                      className="border rounded-xl p-4"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <h4
                        className="text-sm font-medium mb-3"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Résumé
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Catégorie
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {selectedCategoryName || "Aucune"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Tags
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formData.tag_ids && formData.tag_ids.length > 0
                              ? formData.tag_ids
                                  .map((id) => tags.getTagById(id)?.name || "")
                                  .filter(Boolean)
                                  .join(", ")
                              : "Aucun"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Statut
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formData.published ? "Publié" : "Brouillon"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
