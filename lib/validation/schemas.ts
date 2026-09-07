// lib/validation/schemas.ts
import { z } from "zod";

// ============================
// PAGINATION
// ============================

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const ListPodcastSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

// ============================
// POSTS
// ============================

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const UpdatePostSchema = CreatePostSchema.partial();

// ============================
// PODCASTS
// ============================

export const CreatePodcastSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional().default(""),
  audioUrl: z.string().trim().url("L'URL audio est requise"),
  mediaType: z.enum(["AUDIO", "VIDEO"]).default("AUDIO"),
  coverImage: z.string().optional().default(""),
  duration: z.number().int().positive().min(30, "La durée minimale est de 30 secondes"),
  transcript: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
  emissionId: z.string().cuid().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const UpdatePodcastSchema = CreatePodcastSchema.partial();

// ============================
// BOOKS
// ============================

export const CreateBookSchema = z.object({
  title: z.string().min(3).max(200),
  synopsis: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  fileUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().nonnegative().optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const UpdateBookSchema = CreateBookSchema.partial();

export const CreateChapterSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  publishNow: z.boolean().default(false),
});

// ============================
// COMMENTS
// ============================

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const CreateReplySchema = CreateCommentSchema.extend({
  parentId: z.string().cuid(),
});

export const CommentTargetSchema = z.object({
  type: z.enum(["post", "podcast", "book"]),
  id: z.string().cuid(),
});

// ============================
// INTERACTIONS (Like / Bookmark polymorphes)
// ============================

const LikeableTypeSchema = z.enum(["post", "podcast", "book", "comment"]);
const BookmarkableTypeSchema = z.enum(["post", "podcast", "book"]);

export const LikeTargetSchema = z
  .object({ type: LikeableTypeSchema, id: z.string().cuid() })
  .or(z.object({ targetType: LikeableTypeSchema, targetId: z.string().cuid() }))
  .transform((value) =>
    "targetType" in value ? { type: value.targetType, id: value.targetId } : value,
  );

export const BookmarkTargetSchema = z
  .object({ type: BookmarkableTypeSchema, id: z.string().cuid() })
  .or(
    z.object({
      targetType: BookmarkableTypeSchema,
      targetId: z.string().cuid(),
    }),
  )
  .transform((value) =>
    "targetType" in value ? { type: value.targetType, id: value.targetId } : value,
  );

// ============================
// USERS / AUTH
// ============================

export const UsernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(/^[\p{L}\p{N}_-]+$/u);

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: UsernameSchema,
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// ============================
// CATEGORIES / TAGS (admin)
// ============================

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CreateEmissionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
});

export const UpdateEmissionSchema = CreateEmissionSchema.partial();

export const CreateTagSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(300).optional(),
});

// ============================
// SEARCH
// ============================

export const SearchSchema = z.object({
  q: z.string().min(1),
  type: z.enum(["all", "posts", "podcasts", "books", "users", "tags"]).default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});
