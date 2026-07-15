// lib/services/bookmark.service.ts
import { BookmarkRepository } from "../repositories/bookmark.repository";
import { PostRepository } from "../repositories/post.repository";
import { PodcastRepository } from "../repositories/podcast.repository";
import { BookRepository } from "../repositories/book.repository";
import { BookmarkTargetRef } from "../types/target";
import { NotFoundException } from "../exceptions";

export class BookmarkService {
  private bookmarkRepository = new BookmarkRepository();
  private postRepository = new PostRepository();
  private podcastRepository = new PodcastRepository();
  private bookRepository = new BookRepository();

  async toggleBookmark(target: BookmarkTargetRef, userId: string): Promise<boolean> {
    const exists = await this.targetExists(target);
    if (!exists) throw new NotFoundException("Contenu non trouvé");

    const existing = await this.bookmarkRepository.findByUserAndTarget(userId, target);

    if (existing) {
      await this.bookmarkRepository.delete(existing.id);
      await this.updateBookmarksCount(target, -1);
      return false;
    }

    await this.bookmarkRepository.createForTarget(userId, target);
    await this.updateBookmarksCount(target, 1);
    return true;
  }

  async getUserBookmarks(userId: string, page = 1, limit = 10) {
    return this.bookmarkRepository.findByUser(userId, page, limit);
  }

  private async targetExists(target: BookmarkTargetRef): Promise<boolean> {
    switch (target.type) {
      case "post": return !!(await this.postRepository.findById(target.id));
      case "podcast": return !!(await this.podcastRepository.findById(target.id));
      case "book": return !!(await this.bookRepository.findById(target.id));
    }
  }

  private async updateBookmarksCount(target: BookmarkTargetRef, delta: 1 | -1): Promise<void> {
    const increment = delta === 1;
    switch (target.type) {
      case "post":
        return increment
          ? this.postRepository.incrementBookmarks(target.id)
          : this.postRepository.decrementBookmarks(target.id);
      case "podcast":
        return increment
          ? this.podcastRepository.incrementBookmarks(target.id)
          : this.podcastRepository.decrementBookmarks(target.id);
      case "book":
        return increment
          ? this.bookRepository.incrementBookmarks(target.id)
          : this.bookRepository.decrementBookmarks(target.id);
    }
  }
}
