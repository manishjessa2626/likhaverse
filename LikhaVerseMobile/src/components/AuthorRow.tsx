import { TouchableOpacity, Text, Image, View, StyleSheet } from "react-native"

interface Props {
  name: string
  photoURL?: string
  followersCount: number
  onPress: () => void
}

export function AuthorRow({ name, photoURL, followersCount, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: photoURL ?? "https://i.pravatar.cc/100?u=" + name }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.followers}>{followersCount} followers</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2C2C2E",
  },
  info: { flex: 1, marginLeft: 12 },
  name: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  followers: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  arrow: { color: "#636366", fontSize: 22 },
})
