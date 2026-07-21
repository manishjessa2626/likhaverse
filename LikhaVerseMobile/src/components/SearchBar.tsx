import { useState } from "react"
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet } from "react-native"
import type { SearchSuggestion } from "../types"

interface Props {
  onSearch: (query: string) => void
  suggestions?: SearchSuggestion[]
  onSuggestionPress?: (s: SearchSuggestion) => void
  placeholder?: string
}

export function SearchBar({ onSearch, suggestions = [], onSuggestionPress, placeholder = "Search stories, authors..." }: Props) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  const handleSubmit = () => {
    const trimmed = query.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, focused && styles.containerFocused]}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#636366"
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={styles.clear}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {focused && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <FlatList
            data={suggestions}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => onSuggestionPress?.(item)}
              >
                <Text style={styles.suggestionIcon}>
                  {item.type === "story" ? "📖" : item.type === "author" ? "👤" : "#"}
                </Text>
                <Text style={styles.suggestionText}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { zIndex: 100 },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  containerFocused: { borderColor: "#FF4D6D" },
  icon: { fontSize: 16 },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 0,
  },
  clear: { padding: 4 },
  clearText: { color: "#636366", fontSize: 14 },
  suggestions: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    maxHeight: 200,
    zIndex: 200,
    elevation: 10,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  suggestionIcon: { fontSize: 16, marginRight: 10 },
  suggestionText: { color: "#E5E5EA", fontSize: 14 },
})
