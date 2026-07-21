import { View, Text, StyleSheet } from "react-native"
import { useAuth, UserRole } from "../context/AuthContext"

interface Props {
  requiredRole?: UserRole
  requireVIP?: boolean
  requirePremium?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

const roleHierarchy: Record<string, number> = {
  free: 0,
  premium: 1,
  creator: 2,
  vip: 3,
  admin: 4,
  AUTHOR: 2,
  VIP_GOLD: 3,
  PREMIUM_CREATOR: 2,
  SUPER_ADMIN: 5,
  ADMIN: 4,
}

export function RoleGuard({ requiredRole, requireVIP, requirePremium, children, fallback }: Props) {
  const { profile } = useAuth()

  if (!profile) return <>{children}</>

  let hasAccess = true

  if (requireVIP && !profile.isVIP && profile.role !== "vip" && profile.role !== "admin") {
    hasAccess = false
  }

  if (requirePremium && !profile.isPremium && profile.role === "free") {
    hasAccess = false
  }

  if (requiredRole) {
    const userLevel = roleHierarchy[profile.role] ?? 0
    const requiredLevel = roleHierarchy[requiredRole] ?? 0
    if (userLevel < requiredLevel) hasAccess = false
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>
    return (
      <View style={styles.blocked}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Premium Content</Text>
        <Text style={styles.message}>
          Upgrade your account to access this content.
        </Text>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: "#FFF", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  message: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
})
