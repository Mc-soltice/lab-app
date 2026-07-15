// app/(user)/books/new/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Checklist from "@/components/blog/create/Checklist";
import TagInput from "@/components/blog/create/TagInput";
import CoverImageUpload from "@/components/ui/CoverImageUpload";
import SuccessModal from "@/components/ui/SuccessModal";
import { useBook } from "@/hooks/blog/book/useBook";
import { useImageUpload } from "@/hooks/blog/useImageUpload";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CreateBookPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [synopsisFocused, setSynopsisFocused] = useState(false);

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
  } = useBook({
    onSuccess: (book) => {
      console.log("Livre créé avec succès:", book);
      setShowSuccessModal(true);
      setTimeout(() => {
        router.push(`/books/${book.slug}`);
      }, 1600);
    },
    onError: (error) => {
      console.error("Erreur lors de la création du livre:", error);
    },
  });

  const {
    uploadImage,
    uploadFile,
    deleteImage,
    isUploading,
    progress,
    error: uploadError,
  } = useImageUpload();

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Gestionnaire d'upload
  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file, "books/covers");
    if (imageUrl) {
      updateField("cover_image", imageUrl);
    }
  };

  const handleImageRemove = async () => {
    updateField("cover_image", "");
  };

  const handleUrlChange = (url: string) => {
    updateField("cover_image", url);
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const uploadedUrl = await uploadFile(file, "books/files", "raw");
      if (uploadedUrl) {
        updateField("file_url", uploadedUrl);
        toast.success("Fichier PDF prêt à être téléchargé");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload du PDF:", error);
      toast.error("Erreur lors de l'upload du fichier PDF");
    } finally {
      setIsUploadingPdf(false);
      event.target.value = "";
    }
  };

  const handlePdfRemove = () => {
    updateField("file_url", "");
  };

  // Gestion des tags
  const handleTagAdd = async (tagName: string) => {
    if (!tagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const newTag = await tags.createAndSelectTag(tagName.trim());
      if (newTag) {
        const newTagIds = [...(formData.tag_ids || []), newTag.id];
        updateField("tag_ids", newTagIds);
        toast.success(`Tag "${tagName}" ajouté`);
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
        updateField("category_id", String(newCategory.id));
        toast.success(`Catégorie "${categoryName}" ajoutée`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast.error(`Erreur lors de l'ajout de la catégorie "${categoryName}"`);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCategoryRemove = (categoryName: string) => {
    const currentCategory = categories.getCategoryById(
      formData.category_id ?? "",
    );
    if (currentCategory?.name === categoryName) {
      updateField("category_id", "");
    }
  };

  // Checklist
  const checklistItems = [
    { key: "title", label: "Titre défini", done: !!formData.title?.trim() },
    {
      key: "synopsis",
      label: "Synopsis rédigé",
      done: !!formData.synopsis?.trim(),
    },
    {
      key: "cover",
      label: "Image de couverture",
      done: !!formData.cover_image,
    },
    {
      key: "file",
      label: "PDF téléchargeable ajouté",
      done: Boolean(formData.file_url),
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

  const selectedCategoryName = formData.category_id
    ? categories.getCategoryName(formData.category_id)
    : "";

  return (
    <ProtectedRoute fallback={<div className="min-h-screen" />}>
      <main style={{ backgroundColor: "var(--bg-primary)" }}>
        <SuccessModal
          isOpen={showSuccessModal}
          description="Votre livre a bien été créé ! Vous allez être redirigé vers sa page."
        />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* En-tête */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Nouveau livre
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Publiez un nouveau livre numérique
              </p>
            </div>
          </div>

          {/* Checklist mobile */}
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

          <form onSubmit={handleSubmit} className="mt-4">
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
                    className="w-full rounded-xl px-4 py-4 text-2xl sm:text-3xl font-light placeholder:font-light outline-none transition-all duration-200"
                    placeholder="Titre du livre..."
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

                {/* Synopsis */}
                <div
                  className="border rounded-xl p-4 transition-all duration-200"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Synopsis
                  </label>
                  <textarea
                    value={formData.synopsis || ""}
                    onChange={(e) => updateField("synopsis", e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 text-sm rounded-xl resize-none focus:ring-0 outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                      borderWidth: synopsisFocused ? "2px" : "1px",
                    }}
                    onFocus={() => setSynopsisFocused(true)}
                    onBlur={() => setSynopsisFocused(false)}
                    placeholder="Résumé du livre..."
                  />
                  <div className="flex justify-between mt-2">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {formData.synopsis?.length || 0}/2000 caractères
                    </p>
                    {errors.synopsis && (
                      <p className="text-xs" style={{ color: "#DC2626" }}>
                        {errors.synopsis}
                      </p>
                    )}
                  </div>
                </div>

                {/* Prix */}
                <div
                  className="border rounded-xl p-4 transition-all duration-200"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Prix (en euros)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      €
                    </span>
                    <input
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateField("price", value ? parseFloat(value) : null);
                      }}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="0.00 (gratuit)"
                    />
                  </div>
                  <p
                    className="mt-2 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {formData.price && formData.price > 0
                      ? "Livre payant - les utilisateurs devront acheter pour télécharger"
                      : "Livre gratuit - téléchargeable directement"}
                  </p>
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

                {/* Fichier PDF téléchargeable */}
                <div
                  className="border rounded-xl p-4 transition-all duration-200"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Fichier PDF téléchargeable
                  </label>
                  <div
                    className="rounded-xl border border-dashed p-4 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                    />
                    <p
                      className="mt-2 text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {isUploadingPdf
                        ? "Upload du PDF en cours..."
                        : "Sélectionnez un fichier PDF qui sera disponible au téléchargement de votre livre."}
                    </p>
                    {formData.file_url && (
                      <div
                        className="mt-3 flex items-center justify-between rounded-lg border px-3 py-2"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          PDF prêt pour le téléchargement
                        </span>
                        <button
                          type="button"
                          onClick={handlePdfRemove}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Retirer
                        </button>
                      </div>
                    )}
                  </div>
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

                {/* Actions */}
                <div className="flex flex-row gap-2">
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
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {formData.status === "PUBLISHED"
                              ? "● Visible par tous"
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
                        if (!isSubmitting) {
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
                        "Publier le livre"
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
                            Prix
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formData.price && formData.price > 0
                              ? `${formData.price.toFixed(2)} €`
                              : "Gratuit"}
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
