import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { PrismaService } from "../common/prisma.service"

@Injectable()
export class EpisodeService {
  constructor(private prisma: PrismaService) {}

  async create(
    storyId: string,
    data: {
      title: string
      content?: string
      description?: string
      seasonNumber?: number
      episodeNumber?: number
      isFree?: boolean
    },
  ) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")

    const number = data.episodeNumber || 1
    return this.prisma.chapter.create({
      data: {
        storyId,
        title: data.title,
        content: data.content || "",
        number,
        seasonId: data.seasonNumber
          ? (
              await this.prisma.season.upsert({
                where: { storyId_number: { storyId, number: data.seasonNumber } },
                create: { storyId, title: `Season ${data.seasonNumber}`, number: data.seasonNumber },
                update: {},
              })
            ).id
          : undefined,
      },
    })
  }

  async update(
    episodeId: string,
    data: {
      title?: string
      content?: string
      description?: string
      cover?: string
      audioUrl?: string
      status?: string
      isFree?: boolean
    },
  ) {
    const episode = await this.prisma.chapter.findUnique({ where: { id: episodeId } })
    if (!episode) throw new NotFoundException("Episode not found")
    return this.prisma.chapter.update({ where: { id: episodeId }, data })
  }

  async delete(episodeId: string) {
    const episode = await this.prisma.chapter.findUnique({ where: { id: episodeId } })
    if (!episode) throw new NotFoundException("Episode not found")
    return this.prisma.chapter.delete({ where: { id: episodeId } })
  }

  async getById(episodeId: string) {
    const episode = await this.prisma.chapter.findUnique({
      where: { id: episodeId },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            authorId: true,
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
        season: { select: { id: true, title: true, number: true } },
      },
    })
    if (!episode) throw new NotFoundException("Episode not found")
    return episode
  }

  async listByStory(storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")

    return this.prisma.chapter.findMany({
      where: { storyId },
      orderBy: [{ season: { number: "asc" } }, { number: "asc" }],
      include: { season: { select: { id: true, title: true, number: true } } },
    })
  }

  async updateProgress(userId: string, episodeId: string, progress: number, completed?: boolean) {
    const episode = await this.prisma.chapter.findUnique({
      where: { id: episodeId },
      select: { id: true, storyId: true },
    })
    if (!episode) throw new NotFoundException("Episode not found")

    return this.prisma.readingProgress.upsert({
      where: { userId_storyId: { userId, storyId: episode.storyId } },
      create: {
        userId,
        storyId: episode.storyId,
        chapterId: episodeId,
        scrollPosition: progress,
      },
      update: {
        chapterId: episodeId,
        scrollPosition: progress,
      },
    })
  }

  async getProgress(userId: string, episodeId: string) {
    const episode = await this.prisma.chapter.findUnique({
      where: { id: episodeId },
      select: { storyId: true },
    })
    if (!episode) throw new NotFoundException("Episode not found")

    return this.prisma.readingProgress.findFirst({
      where: { userId, chapterId: episodeId },
    })
  }

  async getUserProgress(userId: string, storyId: string) {
    const story = await this.prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new NotFoundException("Story not found")

    return this.prisma.readingProgress.findMany({
      where: { userId, storyId },
      include: { chapter: { select: { id: true, title: true, number: true } } },
    })
  }

  async incrementView(episodeId: string) {
    const episode = await this.prisma.chapter.findUnique({ where: { id: episodeId } })
    if (!episode) throw new NotFoundException("Episode not found")
    return this.prisma.chapter.update({
      where: { id: episodeId },
      data: { wordCount: episode.wordCount },
    })
  }
}
