import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../firebase/config"
import { StoryCard } from "../components/StoryCard"
import type { Story } from "../types"

interface Props {
  onStoryPress: (story: Story) => void
}

export function HomeScreen({ onStoryPress }: Props) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStories = async () => {
    try {
      const q = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(20))
      const snap = await getDocs(q)
      const list: Story[] = []
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Story))
      setStories(list)
    } catch {
      // If Firebase fails, use mock data
      setStories(mockStories)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchStories()
  }

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
        <Text style={styles.logo}>LikhaVerse</Text>
        <Text style={styles.feedLabel}>For You</Text>
      </View>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryCard story={item} onPress={onStoryPress} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4D6D" />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No stories yet</Text>
          </View>
        }
      />
    </View>
  )
}

const mockStories: Story[] = [
  {
    id: "1",
    title: "Whispers of the Heart",
    coverURL: "https://picsum.photos/seed/story1/400/600",
    authorId: "a1",
    authorName: "Elena Martinez",
    description: "A tale of love and destiny...",
    tags: ["Romance", "Drama"],
    likesCount: 1234,
    chaptersCount: 24,
    status: "ongoing",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "2",
    title: "Campus Secrets",
    coverURL: "https://picsum.photos/seed/story2/400/600",
    authorId: "a2",
    authorName: "Jay Cruz",
    description: "College life with a twist...",
    tags: ["Campus", "Mystery"],
    likesCount: 892,
    chaptersCount: 18,
    status: "ongoing",
    createdAt: Date.now() - 172800000,
  },
  {
    id: "3",
    title: "The Last Star",
    coverURL: "https://picsum.photos/seed/story3/400/600",
    authorId: "a3",
    authorName: "Mia Santos",
    description: "Sci-fi adventure across galaxies...",
    tags: ["Sci-Fi", "Adventure"],
    likesCount: 2456,
    chaptersCount: 42,
    status: "completed",
    createdAt: Date.now() - 259200000,
  },
  {
    id: "4",
    title: "Midnight Rain",
    coverURL: "https://picsum.photos/seed/story4/400/600",
    authorId: "a4",
    authorName: "Kyle Reyes",
    description: "Poetry and prose under the rain...",
    tags: ["Poetry", "Romance"],
    likesCount: 567,
    chaptersCount: 12,
    status: "ongoing",
    createdAt: Date.now() - 345600000,
  },
  {
    id: "5",
    title: "Shadow of Destiny",
    coverURL: "https://picsum.photos/seed/story5/400/600",
    authorId: "a5",
    authorName: "Luna Fernandez",
    description: "A dark fantasy epic...",
    tags: ["Fantasy", "Dark"],
    likesCount: 3421,
    chaptersCount: 56,
    status: "ongoing",
    createdAt: Date.now() - 432000000,
  },
]

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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FF4D6D",
  },
  feedLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
  },
  list: {
    paddingBottom: 100,
  },
  emptyText: {
    color: "#636366",
    fontSize: 16,
  },
})
