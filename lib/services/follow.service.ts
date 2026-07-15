// lib/services/follow.service.ts
import { FollowRepository } from "../repositories/follow.repository";
import { UserRepository } from "../repositories/user.repository";
import { NotificationService } from "./notification.service";
import { NotFoundException, ConflictException } from "../exceptions";

export class FollowService {
  private followRepository = new FollowRepository();
  private userRepository = new UserRepository();
  private notificationService = new NotificationService();

  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw new ConflictException("Vous ne pouvez pas vous suivre vous-même");
    }

    const target = await this.userRepository.findById(followingId);
    if (!target) throw new NotFoundException("Utilisateur non trouvé");

    const existing = await this.followRepository.findByFollowerAndFollowing(
      followerId,
      followingId,
    );

    if (existing) {
      await this.followRepository.delete(existing.id);
      return false;
    }

    await this.followRepository.create({
      follower: { connect: { id: followerId } },
      following: { connect: { id: followingId } },
    });

    // Principe 15 : la notification est une conséquence de l'action de suivi.
    await this.notificationService.notifyFollow(followingId, followerId);

    return true;
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    return this.followRepository.getFollowers(userId, page, limit);
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    return this.followRepository.getFollowing(userId, page, limit);
  }
}
