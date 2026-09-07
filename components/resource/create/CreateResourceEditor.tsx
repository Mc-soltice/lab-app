"use client";

import AudioUpload from "@/components/blog/create/AudioUpload";
import Checklist from "@/components/blog/create/Checklist";
import TagInput from "@/components/blog/create/TagInput";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CoverImageUpload from "@/components/ui/CoverImageUpload";
import CreateEditorShell from "@/components/ui/CreateEditorShell";
import SuccessModal from "@/components/ui/SuccessModal";
import { useBook } from "@/hooks/blog/book/useBook";
import { useImageUpload } from "@/hooks/blog/useImageUpload";
import { usePodcast } from "@/hooks/blog/podcast/usePodcast";
import { usePost } from "@/hooks/blog/post/usePost";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export type CreateResourceType = "podcast" | "post" | "book";

interface CreateResourceEditorProps {
  type: CreateResourceType;
}

const resourceCopy: Record<
  CreateResourceType,
  { title: string; subtitle: string; success: string; listPath: string }
> = {
  podcast: {
    title: "Nouvel épisode",
    subtitle: "Préparez votre podcast, ajoutez le média et finalisez sa publication.",
    success: "Votre podcast a bien été créé.",
    listPath: "/dashboard/podcasts",
  },
  post: {
    title: "Nouvel article",
    subtitle: "Rédigez votre contenu, préparez son image et finalisez sa publication.",
    success: "Votre article a bien été créé.",
    listPath: "/dashboard/posts",
  },
  book: {
    title: "Nouveau livre",
    subtitle:
      "Préparez votre livre numérique, son fichier et son visuel de couverture.",
    success: "Votre livre a bien été créé.",
    listPath: "/dashboard/books",
  },
};

export default function CreateResourceEditor({ type }: CreateResourceEditorProps) {
  const router = useRouter();
  const copy = resourceCopy[type];
  const [isMobile, setIsMobile] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingEmission, setIsCreatingEmission] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const podcast = usePodcast({
    onSuccess: () => {
      setShowSuccessModal(true);
      window.setTimeout(() => router.push(copy.listPath), 1600);
    },
  });
  const post = usePost({
    onSuccess: () => {
      setShowSuccessModal(true);
      window.setTimeout(() => router.push(copy.listPath), 1600);
    },
  });
  const book = useBook({
    onSuccess: () => {
      setShowSuccessModal(true);
      window.setTimeout(() => router.push(copy.listPath), 1600);
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

  const active: any = type === "podcast" ? podcast : type === "post" ? post : book;
  const formData: any = active.formData;
  const categories: any = active.categories;
  const emissions: any = active.emissions;
  const tags: any = active.tags;
  const errors: Record<string, string> = active.errors || {};
  const isSubmitting = active.isSubmitting;
  const isBusy =
    isCreatingTag ||
    isCreatingCategory ||
    tags.isCreating ||
    categories.isCreating ||
    emissions?.isCreating ||
    isUploadingPdf;

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const updateField = (field: string, value: unknown) => {
    active.updateField(field as never, value as never);
  };

  const handleTagAdd = async (name: string) => {
    if (!name.trim()) return;
    setIsCreatingTag(true);
    try {
      const tag = await tags.createAndSelectTag(name.trim());
      if (tag) {
        const ids = type === "podcast" ? formData.tagIds : formData.tag_ids || [];
        updateField(type === "podcast" ? "tagIds" : "tag_ids", [...ids, tag.id]);
        toast.success(`Tag "${name}" ajouté`);
      }
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleTagRemove = (name: string) => {
    const tag = tags.getTagByName(name);
    if (!tag) return;
    const field = type === "podcast" ? "tagIds" : "tag_ids";
    const ids = (type === "podcast" ? formData.tagIds : formData.tag_ids || []).filter(
      (id: string) => id !== tag.id,
    );
    updateField(field, ids);
  };

  const handleCategoryAdd = async (name: string) => {
    if (!name.trim()) return;
    setIsCreatingCategory(true);
    try {
      const category = await categories.createAndSelectCategory(name.trim());
      if (category)
        updateField(type === "podcast" ? "categoryId" : "category_id", category.id);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const categoryField = type === "podcast" ? "categoryId" : "category_id";
  const selectedCategoryId = formData[categoryField] || "";
  const selectedCategoryName = selectedCategoryId
    ? categories.getCategoryName(selectedCategoryId)
    : "";

  const handleCategoryRemove = () =>
    updateField(categoryField, type === "podcast" ? "" : null);

  const emissionField = type === "podcast" ? "emissionId" : "emission_id";
  const selectedEmissionId = type === "podcast" ? formData.emissionId || "" : "";
  const selectedEmissionName = selectedEmissionId
    ? emissions.getEmissionName(selectedEmissionId)
    : "";

  const handleEmissionAdd = async (name: string) => {
    if (!name.trim()) return;
    setIsCreatingEmission(true);
    try {
      const emission = await emissions.createAndSelectEmission(name.trim());
      if (emission) {
        updateField("emissionId", emission.id);
        toast.success(`Émission "${name}" ajoutée`);
      }
    } finally {
      setIsCreatingEmission(false);
    }
  };

  const handleEmissionRemove = () => updateField("emissionId", "");

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(
      file,
      type === "book" ? "books/covers" : undefined,
    );
    if (imageUrl)
      updateField(type === "podcast" ? "coverImage" : "cover_image", imageUrl);
  };

  const coverField = type === "podcast" ? "coverImage" : "cover_image";
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Veuillez sélectionner un fichier PDF valide.");
      return;
    }
    setIsUploadingPdf(true);
    try {
      const url = await uploadFile(file, "books/files", "raw");
      if (url) updateField("file_url", url);
    } finally {
      setIsUploadingPdf(false);
      event.target.value = "";
    }
  };

  const submit = (event: React.FormEvent) => {
    if (type === "podcast") return podcast.handleSubmit(event);
    if (type === "post") return post.handleSubmit(event);
    return book.handleSubmit(event);
  };

  const checklistItems = useMemo(() => {
    const common = [
      { key: "title", label: "Titre défini", done: Boolean(formData.title?.trim()) },
      {
        key: "cover",
        label: "Image de couverture",
        done: Boolean(formData[coverField]),
      },
      {
        key: "category",
        label: "Catégorie sélectionnée",
        done: Boolean(selectedCategoryId),
      },
      {
        key: "tags",
        label: "Tag(s) sélectionnés",
        done:
          (type === "podcast" ? formData.tagIds : formData.tag_ids || []).length > 0,
      },
    ];
    if (type === "podcast") {
      return [
        common[0],
        {
          key: "description",
          label: "Description rédigée",
          done: Boolean(formData.description?.trim()),
        },
        {
          key: "media",
          label: "Média ajouté",
          done: Boolean(formData.audioUrl?.trim()),
        },
        ...common.slice(1),
      ];
    }
    if (type === "post") {
      return [
        common[0],
        {
          key: "content",
          label: "Contenu rédigé",
          done: Boolean(formData.content?.trim()),
        },
        {
          key: "excerpt",
          label: "Extrait ajouté",
          done: Boolean(formData.excerpt?.trim()),
        },
        ...common.slice(1),
      ];
    }
    return [
      common[0],
      {
        key: "synopsis",
        label: "Synopsis rédigé",
        done: Boolean(formData.synopsis?.trim()),
      },
      { key: "file", label: "PDF ajouté", done: Boolean(formData.file_url) },
      ...common.slice(1),
    ];
  }, [coverField, formData, selectedCategoryId, type]);

  const completedCount = checklistItems.filter((item) => item.done).length;
  const tagsField = type === "podcast" ? "tagIds" : "tag_ids";
  const selectedTagIds = formData[tagsField] || [];
  const tagNames = tags.tagNames.filter((name: string) =>
    selectedTagIds.some((id: string) => tags.getTagByName(name)?.id === id),
  );
  const published =
    type === "post" ? formData.published : formData.status === "PUBLISHED";
  const setPublished = (value: boolean) =>
    updateField(
      type === "post" ? "published" : "status",
      type === "post" ? value : value ? "PUBLISHED" : "DRAFT",
    );

  return (
    <ProtectedRoute
      allowedRoles={["ADMIN", "GESTIONNAIRE"]}
      fallback={<div className="min-h-screen" />}
    >
      <main style={{ backgroundColor: "var(--bg-primary)" }}>
        <SuccessModal
          isOpen={showSuccessModal}
          description={`${copy.success} Redirection en cours.`}
        />
        <CreateEditorShell
          title={copy.title}
          subtitle={copy.subtitle}
          sidebar={
            <Checklist
              items={checklistItems}
              completedCount={completedCount}
              totalCount={checklistItems.length}
              progressPercentage={(completedCount / checklistItems.length) * 100}
              isMobile={false}
            />
          }
          summaryItems={[
            { label: "Catégorie", value: selectedCategoryName || "Aucune" },
            { label: "Émission", value: selectedEmissionName || "Aucune" },
            { label: "Tags", value: tagNames.join(", ") || "Aucun" },
            { label: "Statut", value: published ? "Publié" : "Brouillon" },
            ...(type === "podcast"
              ? [
                  {
                    label: "Durée",
                    value: formData.duration
                      ? `${Math.floor(formData.duration / 60)}min ${formData.duration % 60}s`
                      : "Non définie",
                  },
                ]
              : type === "book"
                ? [
                    {
                      label: "Prix",
                      value: formData.price ? `${formData.price} €` : "Gratuit",
                    },
                  ]
                : []),
          ]}
        >
          {isMobile && (
            <div className="mb-4">
              <Checklist
                items={checklistItems}
                completedCount={completedCount}
                totalCount={checklistItems.length}
                progressPercentage={(completedCount / checklistItems.length) * 100}
                isMobile
              />
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <input
              type="text"
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              placeholder={`Titre ${type === "podcast" ? "du podcast" : type === "post" ? "de l'article" : "du livre"}...`}
              className="w-full rounded-xl px-4 py-4 text-2xl sm:text-3xl font-light outline-none"
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              style={{
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-secondary)",
                borderColor: isTitleFocused ? "var(--accent)" : "var(--border)",
                borderWidth: "1px",
              }}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}

            {type === "podcast" && (
              <FieldSection label="Description" focused={isDescriptionFocused}>
                <textarea
                  value={formData.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  required
                  rows={6}
                  placeholder="Décrivez votre podcast..."
                  onFocus={() => setIsDescriptionFocused(true)}
                  onBlur={() => setIsDescriptionFocused(false)}
                  className="w-full px-4 py-4 text-sm resize-none outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
              </FieldSection>
            )}

            {type === "post" && (
              <FieldSection label="Contenu">
                <textarea
                  value={formData.content}
                  onChange={(event) => updateField("content", event.target.value)}
                  required
                  rows={14}
                  placeholder="Commencez à écrire..."
                  className="w-full px-4 py-4 text-sm resize-none outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
                <textarea
                  value={formData.excerpt || ""}
                  onChange={(event) => updateField("excerpt", event.target.value)}
                  rows={2}
                  placeholder="Un résumé captivant..."
                  className="w-full border-t px-4 py-3 text-sm resize-none outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)",
                  }}
                />
              </FieldSection>
            )}

            {type === "book" && (
              <FieldSection label="Synopsis">
                <textarea
                  value={formData.synopsis || ""}
                  onChange={(event) => updateField("synopsis", event.target.value)}
                  rows={6}
                  placeholder="Résumé du livre..."
                  className="w-full px-4 py-4 text-sm resize-none outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
              </FieldSection>
            )}

            {type === "podcast" && (
              <>
                <AudioUpload
                  audio_url={formData.audioUrl}
                  media_type={formData.mediaType}
                  onAudioChange={podcast.updateAudio}
                  onAudioRemove={() => updateField("audioUrl", "")}
                />
                <FieldSection label="Durée (secondes)">
                  <input
                    type="number"
                    min={30}
                    value={formData.duration || ""}
                    onChange={(event) =>
                      updateField("duration", Number(event.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </FieldSection>
                <FieldSection label="Transcription (optionnelle)">
                  <textarea
                    value={formData.transcript || ""}
                    onChange={(event) => updateField("transcript", event.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm resize-none outline-none"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </FieldSection>
              </>
            )}

            {type === "book" && (
              <>
                <FieldSection label="Prix (en euros)">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </FieldSection>
                <FieldSection label="Fichier PDF téléchargeable">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="block w-full text-sm"
                  />
                  {isUploadingPdf && (
                    <p className="mt-2 text-xs">Upload du PDF en cours...</p>
                  )}
                  {formData.file_url && (
                    <p className="mt-2 text-xs text-green-600">
                      PDF prêt pour le téléchargement
                    </p>
                  )}
                </FieldSection>
              </>
            )}

            <FieldSection label="Image de couverture">
              <CoverImageUpload
                cover_image={formData[coverField] || ""}
                isUploading={isUploading}
                uploadProgress={progress}
                uploadError={uploadError}
                onImageUpload={handleImageUpload}
                onImageRemove={() => updateField(coverField, "")}
                onUrlChange={(url) => updateField(coverField, url)}
                onDeleteImage={deleteImage}
                maxSize={5}
              />
            </FieldSection>

            {type === "podcast" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TagInput
                  label="Catégorie"
                  items={selectedCategoryName ? [selectedCategoryName] : []}
                  placeholder="Ajouter une catégorie..."
                  onAdd={handleCategoryAdd}
                  onRemove={handleCategoryRemove}
                  availableItems={categories.categoryNames}
                  disabled={isCreatingCategory || categories.isCreating}
                  isCreating={isCreatingCategory || categories.isCreating}
                  maxTags={1}
                />
                <TagInput
                  label="Émission"
                  items={selectedEmissionName ? [selectedEmissionName] : []}
                  placeholder="Ajouter une émission..."
                  onAdd={handleEmissionAdd}
                  onRemove={handleEmissionRemove}
                  availableItems={emissions.emissionNames}
                  disabled={isCreatingEmission || emissions.isCreating}
                  isCreating={isCreatingEmission || emissions.isCreating}
                  maxTags={1}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {type !== "podcast" && (
                <TagInput
                  label="Catégorie"
                  items={selectedCategoryName ? [selectedCategoryName] : []}
                  placeholder="Ajouter une catégorie..."
                  onAdd={handleCategoryAdd}
                  onRemove={handleCategoryRemove}
                  availableItems={categories.categoryNames}
                  disabled={isCreatingCategory || categories.isCreating}
                  isCreating={isCreatingCategory || categories.isCreating}
                  maxTags={1}
                />
              )}
              <TagInput
                label="Tags"
                items={tagNames}
                placeholder="Ajouter un tag..."
                onAdd={handleTagAdd}
                onRemove={handleTagRemove}
                availableItems={tags.tagNames}
                disabled={isCreatingTag || tags.isCreating}
                isCreating={isCreatingTag || tags.isCreating}
                maxTags={10}
              />
            </div>

            <div
              className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <label
                className="flex flex-1 items-center justify-between gap-4 text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                <span>{published ? "Publié" : "Brouillon"}</span>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting || isBusy}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--text-primary)",
                }}
              >
                {isSubmitting
                  ? "Enregistrement en cours..."
                  : published
                    ? `Publier ${type === "podcast" ? "le podcast" : type === "post" ? "l'article" : "le livre"}`
                    : "Enregistrer comme brouillon"}
              </button>
            </div>
            {errors.submit && (
              <p className="text-center text-sm text-red-600">{errors.submit}</p>
            )}
          </form>
        </CreateEditorShell>
      </main>
    </ProtectedRoute>
  );
}

function FieldSection({
  label,
  children,
  focused = false,
}: {
  label: string;
  children: React.ReactNode;
  focused?: boolean;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: focused ? "var(--accent)" : "var(--border)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <label
        className="block border-b px-4 py-2 text-sm font-medium"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
