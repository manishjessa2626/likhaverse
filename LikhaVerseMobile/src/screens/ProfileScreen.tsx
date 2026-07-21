import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { useAuth } from "../context/AuthContext"

export function ProfileScreen() {
  const { user, profile, logout } = useAuth()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: profile?.photoURL ?? `https://i.pravatar.cc/200?u=${user?.uid ?? "default"}` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.displayName ?? user?.displayName ?? "User"}</Text>
        <Text style={styles.username}>@{profile?.username ?? "user"}</Text>
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{profile?.followersCount ?? 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📖</Text>
          <Text style={styles.menuLabel}>My Stories</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❤️</Text>
          <Text style={styles.menuLabel}>Liked Stories</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuLabel}>Settings</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  content: { paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  profileCard: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#2C2C2E",
    marginBottom: 16,
  },
  name: { color: "#FFF", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  username: { color: "#8E8E93", fontSize: 14, marginBottom: 12 },
  bio: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  stats: { flexDirection: "row", gap: 32 },
  statItem: { alignItems: "center" },
  statNum: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#636366", fontSize: 12, marginTop: 2 },
  menu: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
  },
  menuArrow: {
    color: "#636366",
    fontSize: 22,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    gap: 8,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: "#FF4D6D", fontSize: 15, fontWeight: "600" },
})
