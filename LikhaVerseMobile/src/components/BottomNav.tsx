import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface Props {
  currentRoute: string
  onNavigate: (route: string) => void
}

const tabs = [
  { key: "Home", icon: "🏠", label: "Home" },
  { key: "Search", icon: "🔍", label: "Search" },
  { key: "Create", icon: "+", label: "", isSpecial: true },
  { key: "Library", icon: "📚", label: "Library" },
  { key: "Profile", icon: "👤", label: "Profile" },
]

export function BottomNav({ currentRoute, onNavigate }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => {
        const active = currentRoute === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, tab.isSpecial && styles.specialTab]}
            onPress={() => onNavigate(tab.key)}
            activeOpacity={0.7}
          >
            {tab.isSpecial ? (
              <Text style={styles.specialIcon}>+</Text>
            ) : (
              <>
                <Text style={[styles.icon, active && styles.iconActive]}>{tab.icon}</Text>
                <Text style={[styles.label, active && styles.labelActive]}>
                  {tab.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#0F0F0F",
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  specialTab: {
    backgroundColor: "#FF4D6D",
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: -12,
    alignSelf: "center",
    elevation: 6,
    shadowColor: "#FF4D6D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  specialIcon: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },
  icon: {
    fontSize: 20,
  },
  iconActive: {},
  label: {
    color: "#636366",
    fontSize: 10,
    marginTop: 2,
  },
  labelActive: {
    color: "#FF4D6D",
    fontWeight: "600",
  },
})
