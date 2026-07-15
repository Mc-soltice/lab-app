// lib/services/comment.service.ts
import { Comment } from "@/prisma/generated/client";
import { z } from "zod";
import { ForbiddenException, NotFoundException } from "../exceptions";
import { BookRepository } from "../repositories/book.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { PodcastRepository } from "../repositories/podcast.repository";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";
import { CommentTargetRef } from "../types/target";
import { CreateCommentSchema } from "../validation/schemas";
import { NotificationService } from "./notification.service";

export class CommentService {
  private commentRepository = new CommentRepository();
  private postRepository = new PostRepository();
  private podcastRepository = new PodcastRepository();
  private bookRepository = new BookRepository();
  private userRepository = new UserRepository();
  private notificationService = new NotificationService();

  async createComment(
    target: CommentTargetRef,
    userId: string,
    data: z.infer<typeof CreateCommentSchema>,
  ): Promise<Comment> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const owner = await this.resolveOwnerAndValidate(target);

    const comment = await this.commentRepository.createForTarget(
      userId,
      target,
      data.content,
    );

    await this.incrementCommentsCount(target);

    if (owner && owner !== userId) {
      await this.notificationService.notifyComment(owner, userId, target);
    }

    return comment;
  }

  async createReply(
    commentId: string,
    userId: string,
    data: z.infer<typeof CreateCommentSchema>,
  ): Promise<Comment> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const parentComment = await this.commentRepository.findById(commentId);
    if (!parentComment) throw new NotFoundException("Commentaire non trouvé");

    const target = this.targetFromComment(parentComment);

    const reply = await this.commentRepository.create({
      content: data.content,
      author: { connect: { id: userId } },
      parent: { connect: { id: commentId } },
      ...(target.type === "post" && { post: { connect: { id: target.id } } }),
      ...(target.type === "podcast" && {
        podcast: { connect: { id: target.id } },
      }),
      ...(target.type === "book" && { book: { connect: { id: target.id } } }),
    });

    await this.commentRepository.incrementReplies(commentId);
    await this.incrementCommentsCount(target);

    return reply;
  }

  async getTargetComments(target: CommentTargetRef, page = 1, limit = 10) {
    await this.resolveOwnerAndValidate(target);
    return this.commentRepository.findByTarget(target, page, limit);
  }

  async getCommentReplies(commentId: string, page = 1, limit = 10) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundException("Commentaire non trouvé");
    return this.commentRepository.findReplies(commentId, page, limit);
  }

  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundException("Commentaire non trouvé");
    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce commentaire",
      );
    }
    return this.commentRepository.update(commentId, { content });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundException("Commentaire non trouvé");
    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer ce commentaire",
      );
    }

    await this.commentRepository.delete(commentId);

    const target = this.targetFromComment(comment);
    await this.decrementCommentsCount(target);

    if (comment.parentId) {
      await this.commentRepository.decrementReplies(comment.parentId);
    }
  }

  private targetFromComment(comment: {
    postId: string | null;
    podcastId: string | null;
    bookId: string | null;
  }): CommentTargetRef {
    if (comment.postId) return { type: "post", id: comment.postId };
    if (comment.podcastId) return { type: "podcast", id: comment.podcastId };
    if (comment.bookId) return { type: "book", id: comment.bookId };
    throw new NotFoundException("Contenu associé au commentaire introuvable");
  }

  private async resolveOwnerAndValidate(
    target: CommentTargetRef,
  ): Promise<string | null> {
    switch (target.type) {
      case "post": {
        const post = await this.postRepository.findById(target.id);
        if (!post || post.status !== "PUBLISHED") {
          throw new NotFoundException("Publication non trouvée");
        }
        return post.authorId;
      }
      case "podcast": {
        const podcast = await this.podcastRepository.findById(target.id);
        if (!podcast || podcast.status !== "PUBLISHED") {
          throw new NotFoundException("Podcast non trouvé");
        }
        return podcast.authorId;
      }
      case "book": {
        const book = await this.bookRepository.findById(target.id);
        if (!book || book.status !== "PUBLISHED") {
          throw new NotFoundException("Livre non trouvé");
        }
        return book.authorId;
      }
    }
  }

  private async incrementCommentsCount(
    target: CommentTargetRef,
  ): Promise<void> {
    switch (target.type) {
      case "post":
        return this.postRepository.incrementComments(target.id);
      case "podcast":
        return this.podcastRepository.incrementComments(target.id);
      case "book":
        return this.bookRepository.incrementComments(target.id);
    }
  }

  private async decrementCommentsCount(
    target: CommentTargetRef,
  ): Promise<void> {
    switch (target.type) {
      case "post":
        return this.postRepository.decrementComments(target.id);
      case "podcast":
        return this.podcastRepository.decrementComments(target.id);
      case "book":
        return this.bookRepository.decrementComments(target.id);
    }
  }
}
