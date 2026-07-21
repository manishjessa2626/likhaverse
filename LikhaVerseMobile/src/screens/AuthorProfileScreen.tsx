import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { StoryCard } from "../components/StoryCard"
import type { Story, LUser } from "../types"

interface Props {
  authorId: string
  onBack: () => void
  onStoryPress: (story: Story) => void
}

export function AuthorProfileScreen({ authorId, onBack, onStoryPress }: Props) {
  const [author, setAuthor] = useState<LUser | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const snap = await getDoc(doc(db, "users", authorId))
        if (snap.exists()) {
          setAuthor(snap.data() as LUser)
        } else {
          // Mock author
          setAuthor({
            id: authorId,
            email: "",
            username: "author",
            displayName: authorNames[authorId] ?? "Unknown Author",
            photoURL: `https://i.pravatar.cc/200?u=${authorId}`,
            bio: "Passionate storyteller | Dreamer | Coffee addict",
            role: "AUTHOR",
            followersCount: Math.floor(Math.random() * 5000) + 100,
            createdAt: Date.now(),
          })
        }
      } catch {
        setAuthor({
          id: authorId,
          email: "",
          username: "author",
          displayName: authorNames[authorId] ?? "Unknown Author",
          photoURL: `https://i.pravatar.cc/200?u=${authorId}`,
          bio: "Passionate storyteller | Dreamer | Coffee addict",
          role: "AUTHOR",
          followersCount: Math.floor(Math.random() * 5000) + 100,
          createdAt: Date.now(),
        })
      }

      try {
        const q = query(collection(db, "stories"), where("authorId", "==", authorId))
        const snap = await getDocs(q)
        const list: Story[] = []
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Story))
        setStories(list.length > 0 ? list : [])
      } catch {
        setStories([])
      } finally {
        setLoading(false)
      }
    }
    fetchAuthor()
  }, [authorId])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4D6D" />
      </View>
    )
  }

  if (!author) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Author not found</Text>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtnSmall}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryCard story={item} onPress={onStoryPress} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.profile}>
            <Image
              source={{ uri: author.photoURL ?? `https://i.pravatar.cc/200?u=${author.id}` }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{author.displayName}</Text>
            {author.bio && <Text style={styles.bio}>{author.bio}</Text>}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{stories.length}</Text>
                <Text style={styles.statLabel}>Stories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{author.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing(!following)}
            >
              <Text style={[styles.followText, following && styles.followTextActive]}>
                {following ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stories yet</Text>
          </View>
        }
      />
    </View>
  )
}

const authorNames: Record<string, string> = {
  a1: "Elena Martinez",
  a2: "Jay Cruz",
  a3: "Mia Santos",
  a4: "Kyle Reyes",
  a5: "Luna Fernandez",
  a6: "Sofia Reyes",
  a7: "Marco Diaz",
  a8: "Bianca Cruz",
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  center: { flex: 1, backgroundColor: "#0F0F0F", justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 8,
    paddingTop: 52,
  },
  backBtnSmall: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: "#FF4D6D",
    fontSize: 32,
    lineHeight: 34,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backText: { color: "#FF4D6D", fontSize: 15, fontWeight: "600" },
  profile: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#2C2C2E",
    marginBottom: 16,
  },
  name: { color: "#FFF", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  bio: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  stats: { flexDirection: "row", marginBottom: 16, gap: 32 },
  statItem: { alignItems: "center" },
  statNum: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#636366", fontSize: 12, marginTop: 2 },
  followBtn: {
    backgroundColor: "#FF4D6D",
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 24,
  },
  followBtnActive: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#FF4D6D",
  },
  followText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  followTextActive: { color: "#FF4D6D" },
  list: { paddingBottom: 100 },
  emptyContainer: { alignItems: "center", paddingTop: 40 },
  emptyText: { color: "#636366", fontSize: 15 },
  errorText: { color: "#8E8E93", fontSize: 16 },
})
