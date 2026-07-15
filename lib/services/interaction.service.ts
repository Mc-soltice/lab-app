// lib/services/interaction.service.ts
import { LikeRepository } from "../repositories/like.repository";
import { PostRepository } from "../repositories/post.repository";
import { PodcastRepository } from "../repositories/podcast.repository";
import { BookRepository } from "../repositories/book.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { NotificationService } from "./notification.service";
import { NotFoundException } from "../exceptions";
import { TargetRef } from "../types/target";

export class InteractionService {
  private likeRepository = new LikeRepository();
  private postRepository = new PostRepository();
  private podcastRepository = new PodcastRepository();
  private bookRepository = new BookRepository();
  private commentRepository = new CommentRepository();
  private notificationService = new NotificationService();

  async toggleLike(target: TargetRef, userId: string): Promise<boolean> {
    const owner = await this.resolveOwner(target);
    if (!owner) throw new NotFoundException("Contenu non trouvé");

    const existing = await this.likeRepository.findByUserAndTarget(userId, target);

    if (existing) {
      await this.likeRepository.delete(existing.id);
      await this.decrementLikesCount(target);
      return false;
    }

    await this.likeRepository.createForTarget(userId, target);
    await this.incrementLikesCount(target);

    if (owner !== userId) {
      // Principe 15 : les notifications sont une conséquence, jamais déclenchées directement
      await this.notificationService.notifyLike(owner, userId, target);
    }

    return true;
  }

  async getTargetLikes(target: TargetRef, page = 1, limit = 20) {
    const owner = await this.resolveOwner(target);
    if (!owner) throw new NotFoundException("Contenu non trouvé");
    return this.likeRepository.findByTarget(target, page, limit);
  }

  private async resolveOwner(target: TargetRef): Promise<string | null> {
    switch (target.type) {
      case "post":
        return (await this.postRepository.findById(target.id))?.authorId ?? null;
      case "podcast":
        return (await this.podcastRepository.findById(target.id))?.authorId ?? null;
      case "book":
        return (await this.bookRepository.findById(target.id))?.authorId ?? null;
      case "comment":
        return (await this.commentRepository.findById(target.id))?.authorId ?? null;
    }
  }

  private async incrementLikesCount(target: TargetRef): Promise<void> {
    switch (target.type) {
      case "post": return this.postRepository.incrementLikes(target.id);
      case "podcast": return this.podcastRepository.incrementLikes(target.id);
      case "book": return this.bookRepository.incrementLikes(target.id);
      case "comment": return this.commentRepository.incrementLikes(target.id);
    }
  }

  private async decrementLikesCount(target: TargetRef): Promise<void> {
    switch (target.type) {
      case "post": return this.postRepository.decrementLikes(target.id);
      case "podcast": return this.podcastRepository.decrementLikes(target.id);
      case "book": return this.bookRepository.decrementLikes(target.id);
      case "comment": return this.commentRepository.decrementLikes(target.id);
    }
  }
}
