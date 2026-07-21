import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../common/prisma.service"

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        premium: true,
        walletBalance: true,
        createdAt: true,
      },
    })
    if (!user) throw new NotFoundException("User not found")
    return user
  }

  async updateProfile(userId: string, data: { name?: string; bio?: string; avatar?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException("User not found")
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        premium: true,
        walletBalance: true,
        createdAt: true,
      },
    })
  }

  async getFollowers(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: { id: true, name: true, email: true, avatar: true, bio: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ])
    return {
      data: followers.map((f) => f.follower),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getFollowing(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: { id: true, name: true, email: true, avatar: true, bio: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ])
    return {
      data: following.map((f) => f.following),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new ConflictException("Cannot follow yourself")
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    })
    if (existing) throw new ConflictException("Already following this user")
    const target = await this.prisma.user.findUnique({ where: { id: followingId } })
    if (!target) throw new NotFoundException("User to follow not found")
    return this.prisma.follow.create({ data: { followerId, followingId } })
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    })
    if (!existing) throw new NotFoundException("Follow relationship not found")
    return this.prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    })
  }

  async getStories(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where: { authorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.story.count({ where: { authorId: userId } }),
    ])
    return {
      data: stories,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }
}
