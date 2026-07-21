import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "../firebase/config"
import type { Story, Chapter } from "../types"

interface Props {
  story: Story
  onBack: () => void
  onAuthorPress: (authorId: string) => void
}

export function StoryReaderScreen({ story, onBack, onAuthorPress }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const q = query(
          collection(db, "chapters"),
          where("storyId", "==", story.id),
          orderBy("number", "asc"),
        )
        const snap = await getDocs(q)
        const list: Chapter[] = []
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Chapter))
        if (list.length > 0) {
          setChapters(list)
        } else {
          // Mock chapter
          setChapters([
            {
              id: "c1",
              storyId: story.id,
              title: "Chapter 1",
              content: mockContent,
              number: 1,
              createdAt: Date.now(),
            },
          ])
        }
      } catch {
        setChapters([
          {
            id: "c1",
            storyId: story.id,
            title: "Chapter 1",
            content: mockContent,
            number: 1,
            createdAt: Date.now(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchChapters()
  }, [story.id])

  const chapter = chapters[currentChapter]

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4D6D" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{story.title}</Text>
          <TouchableOpacity onPress={() => onAuthorPress(story.authorId)}>
            <Text style={styles.headerAuthor}>{story.authorName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.chapterTitle}>{chapter?.title ?? "Chapter 1"}</Text>
        <Text style={styles.chapterBody}>{chapter?.content ?? mockContent}</Text>
      </ScrollView>

      {chapters.length > 1 && (
        <View style={styles.chapterNav}>
          <TouchableOpacity
            style={[styles.chapterBtn, currentChapter === 0 && styles.chapterBtnDisabled]}
            onPress={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
            disabled={currentChapter === 0}
          >
            <Text style={styles.chapterBtnText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.chapterNum}>
            {currentChapter + 1} / {chapters.length}
          </Text>
          <TouchableOpacity
            style={[styles.chapterBtn, currentChapter === chapters.length - 1 && styles.chapterBtnDisabled]}
            onPress={() => setCurrentChapter(Math.min(chapters.length - 1, currentChapter + 1))}
            disabled={currentChapter === chapters.length - 1}
          >
            <Text style={styles.chapterBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setLiked(!liked)}>
          <Text style={[styles.actionIcon, liked && styles.actionIconActive]}>
            {liked ? "❤️" : "🤍"}
          </Text>
          <Text style={[styles.actionText, liked && styles.actionTextActive]}>
            {story.likesCount + (liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setSaved(!saved)}>
          <Text style={styles.actionIcon}>{saved ? "🔖" : "📑"}</Text>
          <Text style={[styles.actionText, saved && styles.actionTextActive]}>
            {saved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const mockContent = `The rain fell softly against the windowpane, each droplet tracing a path through the dim light of the afternoon. She sat there, watching the world outside blur into a watercolor of grays and greens, her fingers wrapped around a mug that had long gone cold.

"I never thought I'd find you here," a voice said from behind her.

She didn't turn around. She knew that voice too well. It had haunted her dreams for the past three years, ever since that night when everything changed.

"The coffee shop is open to everyone," she replied, her voice steady despite the pounding in her chest. "Last I checked, there was no law against sitting by the window."

A soft chuckle. The sound of a chair being pulled out. The creak of leather as someone sat down across from her.

"You've changed," he said.

She finally turned to look at him. Three years had added faint lines around his eyes, a touch of gray at his temples. But his smile was the same — that crooked, disarming smile that had once made her believe in forever.

"We all change," she said. "That's what life does to us."

The rain continued to fall, washing away the old and making way for the new. Somewhere in the distance, thunder rumbled, a promise of storms to come.

Or perhaps, of storms finally passing.

"Can we start over?" he asked, his voice barely above a whisper.

She looked into his eyes, searching for the boy she had once loved. The man sitting before her was a stranger, and yet, the familiar ache in her chest told her otherwise.

"I don't know," she answered honestly. "But I suppose we can try."

And for the first time in three years, she smiled.`

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  center: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#FF4D6D",
    fontSize: 32,
    lineHeight: 34,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerAuthor: {
    color: "#FF4D6D",
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  chapterTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  chapterBody: {
    color: "#E5E5EA",
    fontSize: 16,
    lineHeight: 28,
  },
  chapterNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
  },
  chapterBtn: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chapterBtnDisabled: {
    opacity: 0.4,
  },
  chapterBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  chapterNum: {
    color: "#636366",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    backgroundColor: "#0F0F0F",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionIconActive: {
    fontSize: 18,
  },
  actionText: {
    color: "#636366",
    fontSize: 13,
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#FF4D6D",
  },
})
