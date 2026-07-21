import { useState, useEffect, useMemo } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "../firebase/config"
import { StoryCard } from "../components/StoryCard"
import { AuthorRow } from "../components/AuthorRow"
import { SearchBar } from "../components/SearchBar"
import type { Story, LUser, SearchSuggestion } from "../types"

interface Props {
  initialQuery: string
  onStoryPress: (story: Story) => void
  onAuthorPress: (authorId: string) => void
  onBack: () => void
}

type FilterTab = "stories" | "authors" | "tags"

export function SearchResultsScreen({ initialQuery, onStoryPress, onAuthorPress, onBack }: Props) {
  const [query_text, setQueryText] = useState(initialQuery)
  const [filter, setFilter] = useState<FilterTab>("stories")
  const [stories, setStories] = useState<Story[]>([])
  const [authors, setAuthors] = useState<LUser[]>([])
  const [loading, setLoading] = useState(true)

  const doSearch = async (q: string) => {
    setQueryText(q)
    setLoading(true)
    try {
      const lower = q.toLowerCase()
      const storySnap = await getDocs(query(collection(db, "stories"), orderBy("likesCount", "desc"), limit(20)))
      const storyResults: Story[] = []
      storySnap.forEach((doc) => {
        const data = doc.data() as Omit<Story, "id">
        if (data.title?.toLowerCase().includes(lower) || data.tags?.some((t) => t.toLowerCase().includes(lower))) {
          storyResults.push({ id: doc.id, ...data })
        }
      })
      setStories(storyResults.length > 0 ? storyResults : mockResults.filter((s) =>
        s.title.toLowerCase().includes(lower) || s.tags.some((t) => t.toLowerCase().includes(lower))
      ))

      const userSnap = await getDocs(query(collection(db, "users"), limit(20)))
      const authorResults: LUser[] = []
      userSnap.forEach((doc) => {
        const data = doc.data() as Omit<LUser, "id">
        if (data.displayName?.toLowerCase().includes(lower) || data.username?.toLowerCase().includes(lower)) {
          authorResults.push({ id: doc.id, ...data })
        }
      })
      setAuthors(authorResults.length > 0 ? authorResults : [])
    } catch {
      setStories(mockResults.filter((s) =>
        s.title.toLowerCase().includes(query_text.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(query_text.toLowerCase()))
      ))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    doSearch(initialQuery)
  }, [initialQuery])

  const topResult = useMemo(() => stories[0] ?? null, [stories])

  const handleSearch = (q: string) => {
    doSearch(q)
  }

  const showStories = filter === "stories" || filter === "tags"

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <SearchBar onSearch={handleSearch} placeholder="Search..." />
        </View>
      </View>

      {topResult && filter === "stories" && (
        <View style={styles.topResult}>
          <Text style={styles.topLabel}>Top Result</Text>
          <StoryCard story={topResult} onPress={onStoryPress} />
        </View>
      )}

      <View style={styles.filters}>
        {(["stories", "authors", "tags"] as FilterTab[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4D6D" />
        </View>
      ) : showStories ? (
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StoryCard story={item} onPress={onStoryPress} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={authors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AuthorRow
              name={item.displayName}
              photoURL={item.photoURL}
              followersCount={item.followersCount}
              onPress={() => onAuthorPress(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No authors found</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const mockResults: Story[] = [
  {
    id: "m1",
    title: "Hearts on Fire",
    coverURL: "https://picsum.photos/seed/m1/400/600",
    authorId: "a6",
    authorName: "Sofia Reyes",
    description: "",
    tags: ["Romance"],
    likesCount: 4321,
    chaptersCount: 35,
    status: "ongoing",
    createdAt: Date.now(),
  },
  {
    id: "m2",
    title: "The Hidden Realm",
    coverURL: "https://picsum.photos/seed/m2/400/600",
    authorId: "a7",
    authorName: "Marco Diaz",
    description: "",
    tags: ["Fantasy", "Adventure"],
    likesCount: 3765,
    chaptersCount: 48,
    status: "ongoing",
    createdAt: Date.now(),
  },
  {
    id: "m3",
    title: "Campus Love Stories",
    coverURL: "https://picsum.photos/seed/m3/400/600",
    authorId: "a8",
    authorName: "Bianca Cruz",
    description: "",
    tags: ["Campus", "Romance"],
    likesCount: 2890,
    chaptersCount: 15,
    status: "completed",
    createdAt: Date.now(),
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 52,
    paddingBottom: 8,
  },
  backBtn: {
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
  searchWrap: {
    flex: 1,
  },
  topResult: {
    paddingVertical: 8,
  },
  topLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
  },
  filterBtnActive: {
    backgroundColor: "#FF4D6D",
  },
  filterText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  list: {
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#636366",
    fontSize: 15,
  },
})
