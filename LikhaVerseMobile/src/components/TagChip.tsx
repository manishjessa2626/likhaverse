import { TouchableOpacity, Text, StyleSheet } from "react-native"

interface Props {
  label: string
  selected?: boolean
  onPress: () => void
}

export function TagChip({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>#{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#FF4D6D20",
    borderColor: "#FF4D6D",
  },
  label: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
  },
  labelSelected: {
    color: "#FF4D6D",
  },
})
