import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { PrismaService } from "../common/prisma.service"

@Injectable()
export class StoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    authorId: string,
    data: { title: string; description?: string; category?: string; tags?: string; mature?: boolean },
  ) {
    return this.prisma.story.create({
      data: {
        authorId,
        title: data.title,
        description: data.description,
        tags: data.tags,
      },
    })
  }

  async update(
    storyId: string,
    authorId: string,
    data: {
      title?: string
      description?: string
      cover?: string
      category?: string
      tags?: string
      status?: string
      mature?: boolean
    },
  ) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")
    if (story.authorId !== authorId) throw new ForbiddenException("You can only update your own stories")
    return this.prisma.story.update({ where: { id: storyId }, data })
  }

  async delete(storyId: string, authorId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")
    if (story.authorId !== authorId) throw new ForbiddenException("You can only delete your own stories")
    return this.prisma.story.delete({ where: { id: storyId } })
  }

  async getById(storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
        _count: {
          select: { chapters: true, storyLikes: true, saves: true, comments: true },
        },
      },
    })
    if (!story) throw new NotFoundException("Story not found")
    return story
  }

  async list(params: {
    page?: number
    limit?: number
    category?: string
    status?: string
    search?: string
    sort?: string
  }) {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}
    if (params.status) where.status = params.status
    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ]
    }
    if (params.category) {
      where.tags = { contains: params.category }
    }

    let orderBy: any = { createdAt: "desc" }
    if (params.sort === "views") orderBy = { viewCount: "desc" }
    else if (params.sort === "title") orderBy = { title: "asc" }
    else if (params.sort === "oldest") orderBy = { createdAt: "asc" }

    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { chapters: true, storyLikes: true },
          },
        },
      }),
      this.prisma.story.count({ where }),
    ])

    return {
      data: stories,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getByAuthor(authorId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where: { authorId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { chapters: true, storyLikes: true } },
        },
      }),
      this.prisma.story.count({ where: { authorId } }),
    ])
    return {
      data: stories,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async incrementView(storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")
    return this.prisma.story.update({
      where: { id: storyId },
      data: { viewCount: { increment: 1 } },
    })
  }

  async incrementLike(storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")
    const count = await this.prisma.storyLike.count({ where: { storyId } })
    return { storyId, likeCount: count }
  }

  async incrementSave(storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")
    const count = await this.prisma.save.count({ where: { storyId } })
    return { storyId, saveCount: count }
  }
}
