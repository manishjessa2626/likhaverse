import { TouchableOpacity, Text, Image, View, StyleSheet } from "react-native"
import type { Story } from "../types"

interface Props {
  story: Story
  onPress: (story: Story) => void
}

export function StoryCard({ story, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(story)} activeOpacity={0.85}>
      <Image source={{ uri: story.coverURL }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.author}>{story.authorName}</Text>
        <View style={styles.row}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={styles.likes}>{story.likesCount}</Text>
          <Text style={styles.chapters}>{story.chaptersCount} ch.</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: "row",
    height: 130,
  },
  cover: {
    width: 90,
    height: "100%",
    borderRadius: 0,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  author: {
    color: "#8E8E93",
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heartIcon: { fontSize: 12 },
  likes: {
    color: "#FF4D6D",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 12,
  },
  chapters: {
    color: "#636366",
    fontSize: 12,
  },
})
