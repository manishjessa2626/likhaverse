import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "../firebase/config"
import { StoryCard } from "../components/StoryCard"
import { useAuth } from "../context/AuthContext"
import type { Story } from "../types"

interface Props {
  onStoryPress: (story: Story) => void
}

type Tab = "saved" | "recent"

export function LibraryScreen({ onStoryPress }: Props) {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("saved")
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(10))
        const snap = await getDocs(q)
        const list: Story[] = []
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Story))
        setStories(list.length > 0 ? list : mockLibrary)
      } catch {
        setStories(mockLibrary)
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4D6D" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>

      <View style={styles.tabs}>
        <TabBtn label="Saved" active={tab === "saved"} onPress={() => setTab("saved")} />
        <TabBtn label="Recent" active={tab === "recent"} onPress={() => setTab("recent")} />
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryCard story={item} onPress={onStoryPress} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              {tab === "saved" ? "Stories you save will appear here" : "Recently read stories will appear here"}
            </Text>
          </View>
        }
      />
    </View>
  )
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <View
      style={[styles.tab, active && styles.tabActive]}
      onTouchEnd={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </View>
  )
}

const mockLibrary: Story[] = [
  {
    id: "lib1",
    title: "Whispers of the Heart",
    coverURL: "https://picsum.photos/seed/lib1/400/600",
    authorId: "a1",
    authorName: "Elena Martinez",
    description: "",
    tags: ["Romance"],
    likesCount: 1234,
    chaptersCount: 24,
    status: "ongoing",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "lib2",
    title: "The Last Star",
    coverURL: "https://picsum.photos/seed/lib2/400/600",
    authorId: "a3",
    authorName: "Mia Santos",
    description: "",
    tags: ["Sci-Fi"],
    likesCount: 2456,
    chaptersCount: 42,
    status: "completed",
    createdAt: Date.now() - 259200000,
  },
]

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  center: { flex: 1, backgroundColor: "#0F0F0F", justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    position: "relative",
  },
  tabActive: {
    backgroundColor: "#2C2C2E",
  },
  tabText: {
    color: "#636366",
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    left: "20%",
    right: "20%",
    height: 2,
    backgroundColor: "#FF4D6D",
    borderRadius: 1,
  },
  list: { paddingBottom: 100 },
  emptyContainer: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { color: "#FFF", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptyText: { color: "#636366", fontSize: 14, textAlign: "center", lineHeight: 20 },
})
