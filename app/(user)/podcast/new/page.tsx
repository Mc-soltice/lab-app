// app/podcast/page.tsx
"use client";

import { usePodcast } from "@/hooks/blog/podcast/usePodcast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AudioUpload from "@/components/blog/create/AudioUpload";
import Checklist from "@/components/blog/create/Checklist";
import TagInput from "@/components/blog/create/TagInput";
import CoverImageUpload from "@/components/ui/CoverImageUpload";
import SuccessModal from "@/components/ui/SuccessModal";
import { useImageUpload } from "@/hooks/blog/useImageUpload";

export default function CreatePodcastPage() {
  const router = useRouter();

  const {
    formData,
    updateField,
    updateAudio,
    handleSubmit,
    isSubmitting,
    categories,
    tags,
    isValid,
    errors,
    resetForm,
    hasAttemptedSubmit,
  } = usePodcast({
    onSuccess: (podcast) => {
      console.log("Podcast créé avec succès:", podcast);
      setShowSuccessModal(true);
      window.setTimeout(() => {
        router.push("/podcast");
      }, 1600);
    },
    onError: (error) => {
      console.error("Erreur lors de la création du podcast:", error);
    },
  });

  // États UI
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
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
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Gestionnaire d'upload d'image
  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      updateField("coverImage", imageUrl);
    }
  };

  const handleImageRemove = async () => {
    updateField("coverImage", "");
  };

  const handleUrlChange = (url: string) => {
    updateField("coverImage", url);
  };

  // Gestion des tags
  const handleTagAdd = async (tagName: string) => {
    if (!tagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const newTag = await tags.createAndSelectTag(tagName.trim());
      if (newTag) {
        const newTagIds = [...(formData.tagIds || []), newTag.id];
        updateField("tagIds", newTagIds);
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
      const newTagIds = (formData.tagIds || []).filter((id) => id !== tag.id);
      updateField("tagIds", newTagIds);
      toast.success(`Tag "${tagName}" retiré`);
    }
  };

  // Gestion des catégories
  const handleCategoryAdd = async (categoryName: string) => {
    if (!categoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const newCategory = await categories.createAndSelectCategory(
        categoryName.trim(),
      );
      if (newCategory) {
        updateField("categoryId", String(newCategory.id));
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

  const handleCategoryRemove = (categoryName: string) => {
    const currentCategory = categories.getCategoryById(formData.categoryId);
    if (currentCategory?.name === categoryName) {
      updateField("categoryId", "");
      toast.success(`Catégorie "${categoryName}" retirée`);
    }
  };

  // Checklist items
  const checklistItems = [
    { key: "title", label: "Titre défini", done: !!formData.title?.trim() },
    {
      key: "description",
      label: "Description rédigée",
      done: !!formData.description?.trim(),
    },
    {
      key: "audio",
      label: "Fichier audio ajouté",
      done: !!formData.audioUrl?.trim(),
    },
    {
      key: "cover",
      label: "Image de couverture",
      done: !!formData.coverImage,
    },
    {
      key: "category",
      label: "Catégorie sélectionnée",
      done: Boolean(formData.categoryId),
    },
    {
      key: "tags",
      label: "Tag(s) sélectionnés",
      done: (formData.tagIds?.length ?? 0) > 0,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.done).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Récupérer le nom de la catégorie sélectionnée
  const selectedCategoryName = formData.categoryId
    ? categories.getCategoryName(formData.categoryId)
    : "";

  return (
    <ProtectedRoute fallback={<div className="min-h-screen" />}>
      <main style={{ backgroundColor: "var(--bg-primary)" }}>
        <SuccessModal
          isOpen={showSuccessModal}
          description="Votre podcast a bien été créé et vous allez être redirigé vers l'accueil."
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
                    placeholder="Titre du podcast..."
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

                {/* Description */}
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
                    <span
                      className="text-sm px-2 py-2"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Description
                    </span>
                  </div>

                  <textarea
                    ref={descriptionTextareaRef}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    required
                    rows={6}
                    className="w-full px-4 py-4 border-none focus:ring-0 font-mono text-sm resize-none outline-none"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Décrivez votre podcast..."
                    onFocus={() => setEditorFocused(true)}
                    onBlur={() => setEditorFocused(false)}
                  />
                  {errors.description && (
                    <p
                      className="px-4 pb-2 text-sm"
                      style={{ color: "#DC2626" }}
                    >
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Fichier audio */}
                <AudioUpload
                  audio_url={formData.audioUrl}
                  onAudioChange={updateAudio}
                  onAudioRemove={() => updateField("audioUrl", "")}
                />
                {errors.audioUrl && (
                  <p className="text-sm" style={{ color: "#DC2626" }}>
                    {errors.audioUrl}
                  </p>
                )}

                {/* Durée */}
                <div
                  className="border rounded-xl p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Durée (secondes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      updateField("duration", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                      borderWidth: "1px",
                    }}
                    placeholder="Ex: 3600 pour 1 heure"
                    min={30}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm" style={{ color: "#DC2626" }}>
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Transcription */}
                <div
                  className="border rounded-xl p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Transcription (optionnelle)
                  </label>
                  <textarea
                    value={formData.transcript || ""}
                    onChange={(e) => updateField("transcript", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-xl resize-none outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                      borderWidth: "1px",
                    }}
                    placeholder="Transcription textuelle de l'épisode..."
                  />
                </div>

                {/* Image de couverture */}
                <div
                  className="border p-4 rounded-xl"
                  style={{ borderColor: "var(--border)" }}
                >
                  <CoverImageUpload
                    cover_image={formData.coverImage || ""}
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

                  <TagInput
                    label="Tags"
                    items={tags.tagNames.filter((name) =>
                      formData.tagIds?.some(
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

                {/* Statut et Submit */}
                <div className="w-full flex flex-row gap-2">
                  {/* Bloc Statut */}
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
                            {formData.status === "PUBLISHED"
                              ? "Publié"
                              : "Brouillon"}
                          </p>
                          <p
                            className="text-xs transition-all duration-300"
                            style={{
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {formData.status === "PUBLISHED"
                              ? "● Publié"
                              : "● Non publié"}
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.status === "PUBLISHED"}
                            onChange={(e) =>
                              updateField(
                                "status",
                                e.target.checked ? "PUBLISHED" : "DRAFT",
                              )
                            }
                          />
                          <div
                            className={`
                              relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out
                              ${formData.status === "PUBLISHED" ? "bg-(--accent)" : "bg-(--border)"}
                              after:content-[''] after:absolute after:top-0.5 after:left-0.5
                              after:bg-white after:rounded-full after:h-5 after:w-5 
                              after:transition-all after:duration-300 after:ease-in-out
                              ${
                                formData.status === "PUBLISHED"
                                  ? "after:translate-x-5 after:shadow-md"
                                  : "after:translate-x-0 after:shadow-sm"
                              }
                              hover:scale-105
                            `}
                            style={{
                              backgroundColor:
                                formData.status === "PUBLISHED"
                                  ? "var(--accent)"
                                  : "var(--border)",
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
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
                          {formData.status === "PUBLISHED"
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
                      ) : formData.status === "PUBLISHED" ? (
                        "Publier le podcast"
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
                            {formData.tagIds && formData.tagIds.length > 0
                              ? formData.tagIds
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
                            {formData.status === "PUBLISHED"
                              ? "Publié"
                              : "Brouillon"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Durée
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formData.duration > 0
                              ? `${Math.floor(formData.duration / 60)}min ${formData.duration % 60}s`
                              : "Non définie"}
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
