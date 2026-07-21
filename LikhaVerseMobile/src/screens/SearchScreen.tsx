import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet } from "react-native"
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore"
import { db } from "../firebase/config"
import { SearchBar } from "../components/SearchBar"
import { StoryCard } from "../components/StoryCard"
import { AuthorRow } from "../components/AuthorRow"
import { TagChip } from "../components/TagChip"
import type { Story, SearchSuggestion } from "../types"

interface Props {
  onStoryPress: (story: Story) => void
  onAuthorPress: (authorId: string) => void
  onSearchSubmit: (query: string) => void
}

const trendingTags = ["Romance", "Campus", "Fantasy", "Sci-Fi", "Mystery", "Poetry", "Horror", "Comedy"]

export function SearchScreen({ onStoryPress, onAuthorPress, onSearchSubmit }: Props) {
  const [popularStories, setPopularStories] = useState<Story[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])

  useEffect(() => {
    // Load popular stories
    const load = async () => {
      try {
        const q = query(collection(db, "stories"), orderBy("likesCount", "desc"), limit(5))
        const snap = await getDocs(q)
        const list: Story[] = []
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Story))
        setPopularStories(list)
      } catch {
        setPopularStories(mockPopular)
      }
    }
    load()
  }, [])

  const handleSearchInput = (text: string) => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }
    const lower = text.toLowerCase()
    const matches: SearchSuggestion[] = [
      ...mockPopular.filter((s) => s.title.toLowerCase().includes(lower)).map((s) => ({ type: "story" as const, text: s.title, id: s.id })),
      ...trendingTags.filter((t) => t.toLowerCase().includes(lower)).map((t) => ({ type: "tag" as const, text: t })),
    ]
    setSuggestions(matches.slice(0, 5))
  }

  const handleSuggestionPress = (s: SearchSuggestion) => {
    if (s.type === "tag") {
      onSearchSubmit(s.text)
    } else if (s.id) {
      const story = mockPopular.find((st) => st.id === s.id) ?? popularStories.find((st) => st.id === s.id)
      if (story) onStoryPress(story)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>

      <View style={styles.searchWrapper}>
        <SearchBar
          onSearch={onSearchSubmit}
          suggestions={suggestions}
          onSuggestionPress={handleSuggestionPress}
        />
      </View>

      <FlatList
        data={["_tags", "_popular"]}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item === "_tags") {
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Tags</Text>
                <View style={styles.tagsRow}>
                  {trendingTags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      onPress={() => onSearchSubmit(tag)}
                    />
                  ))}
                </View>
              </View>
            )
          }
          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Stories</Text>
              {(popularStories.length > 0 ? popularStories : mockPopular).map((story) => (
                <StoryCard key={story.id} story={story} onPress={onStoryPress} />
              ))}
            </View>
          )
        }}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  )
}

const mockPopular: Story[] = [
  {
    id: "pop1",
    title: "Hearts on Fire",
    coverURL: "https://picsum.photos/seed/pop1/400/600",
    authorId: "a6",
    authorName: "Sofia Reyes",
    description: "A passionate love story...",
    tags: ["Romance"],
    likesCount: 4321,
    chaptersCount: 35,
    status: "ongoing",
    createdAt: Date.now(),
  },
  {
    id: "pop2",
    title: "The Hidden Realm",
    coverURL: "https://picsum.photos/seed/pop2/400/600",
    authorId: "a7",
    authorName: "Marco Diaz",
    description: "Fantasy world waiting to be discovered...",
    tags: ["Fantasy", "Adventure"],
    likesCount: 3765,
    chaptersCount: 48,
    status: "ongoing",
    createdAt: Date.now(),
  },
  {
    id: "pop3",
    title: "Campus Love Stories",
    coverURL: "https://picsum.photos/seed/pop3/400/600",
    authorId: "a8",
    authorName: "Bianca Cruz",
    description: "College romance anthology...",
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
})
