import { useState, useCallback } from "react"
import { View, StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useAuth } from "../context/AuthContext"
import { BottomNav } from "../components/BottomNav"
import { WelcomeScreen } from "../screens/WelcomeScreen"
import { LoginScreen } from "../screens/LoginScreen"
import { RegisterScreen } from "../screens/RegisterScreen"
import { OtpVerificationScreen } from "../screens/OtpVerificationScreen"
import { HomeScreen } from "../screens/HomeScreen"
import { SearchScreen } from "../screens/SearchScreen"
import { SearchResultsScreen } from "../screens/SearchResultsScreen"
import { StoryReaderScreen } from "../screens/StoryReaderScreen"
import { AuthorProfileScreen } from "../screens/AuthorProfileScreen"
import { LibraryScreen } from "../screens/LibraryScreen"
import { ProfileScreen } from "../screens/ProfileScreen"
import type { Story } from "../types"

type Screen =
  | { name: "Welcome" }
  | { name: "Login" }
  | { name: "Register" }
  | { name: "OtpVerification"; email: string }
  | { name: "Home" }
  | { name: "Search" }
  | { name: "SearchResults"; query: string }
  | { name: "Reader"; story: Story }
  | { name: "AuthorProfile"; authorId: string }
  | { name: "Library" }
  | { name: "Profile" }
  | { name: "Create" }

export function AppNavigator() {
  const { user, loading } = useAuth()
  const [screenStack, setScreenStack] = useState<Screen[]>([{ name: "Home" }])

  const currentScreen = screenStack[screenStack.length - 1]

  const push = useCallback((screen: Screen) => {
    setScreenStack((prev) => [...prev, screen])
  }, [])

  const pop = useCallback(() => {
    setScreenStack((prev) => prev.slice(0, -1))
  }, [])

  const switchTab = useCallback((name: Screen["name"]) => {
    setScreenStack((prev) => {
      if (name === "Home") return [{ name: "Home" }]
      if (name === "Search") return [{ name: "Search" }]
      if (name === "Library") return [{ name: "Library" }]
      if (name === "Profile") return [{ name: "Profile" }]
      return prev
    })
  }, [])

  if (loading) {
    return <View style={styles.loading} />
  }

  // --- Auth flow ---
  if (!user) {
    const screenName = currentScreen.name

    // Welcome screen
    if (screenName === "Welcome") {
      return (
        <View style={styles.container}>
          <WelcomeScreen
            onGoogle={async () => {
              // Google OAuth would use expo-auth-session
              // For now, show the email option
              push({ name: "Login" })
            }}
            onFacebook={async () => {
              push({ name: "Login" })
            }}
            onEmail={() => push({ name: "Login" })}
            onPhone={() => push({ name: "Login" })}
            onLogin={() => push({ name: "Login" })}
          />
        </View>
      )
    }

    if (screenName === "Login") {
      return (
        <View style={styles.container}>
          <LoginScreen
            onGoBack={() => pop()}
            onOtpSent={(email) => push({ name: "OtpVerification", email })}
          />
        </View>
      )
    }

    if (screenName === "Register") {
      return (
        <View style={styles.container}>
          <RegisterScreen
            onBack={() => pop()}
            onComplete={() => setScreenStack([{ name: "Home" }])}
          />
        </View>
      )
    }

    if (screenName === "OtpVerification") {
      return (
        <View style={styles.container}>
          <OtpVerificationScreen
            email={currentScreen.email}
            onVerified={() => setScreenStack([{ name: "Home" }])}
            onBack={() => pop()}
          />
        </View>
      )
    }

    // Default to Welcome
    return (
      <View style={styles.container}>
        <WelcomeScreen
          onGoogle={() => push({ name: "Login" })}
          onFacebook={() => push({ name: "Login" })}
          onEmail={() => push({ name: "Login" })}
          onPhone={() => push({ name: "Login" })}
          onLogin={() => push({ name: "Login" })}
        />
      </View>
    )
  }

  // --- Main app (authenticated) ---
  const showBottomNav = ["Home", "Search", "Library", "Profile"].includes(currentScreen.name)

  const renderScreen = () => {
    switch (currentScreen.name) {
      case "Home":
        return <HomeScreen onStoryPress={(story) => push({ name: "Reader", story })} />
      case "Search":
        return (
          <SearchScreen
            onStoryPress={(story) => push({ name: "Reader", story })}
            onAuthorPress={(authorId) => push({ name: "AuthorProfile", authorId })}
            onSearchSubmit={(query) => push({ name: "SearchResults", query })}
          />
        )
      case "SearchResults":
        return (
          <SearchResultsScreen
            initialQuery={currentScreen.query}
            onStoryPress={(story) => push({ name: "Reader", story })}
            onAuthorPress={(authorId) => push({ name: "AuthorProfile", authorId })}
            onBack={pop}
          />
        )
      case "Reader":
        return (
          <StoryReaderScreen
            story={currentScreen.story}
            onBack={pop}
            onAuthorPress={(authorId) => push({ name: "AuthorProfile", authorId })}
          />
        )
      case "AuthorProfile":
        return (
          <AuthorProfileScreen
            authorId={currentScreen.authorId}
            onBack={pop}
            onStoryPress={(story) => push({ name: "Reader", story })}
          />
        )
      case "Library":
        return <LibraryScreen onStoryPress={(story) => push({ name: "Reader", story })} />
      case "Profile":
        return <ProfileScreen />
      default:
        return <HomeScreen onStoryPress={(story) => push({ name: "Reader", story })} />
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {renderScreen()}
        {showBottomNav && (
          <BottomNav
            currentRoute={currentScreen.name}
            onNavigate={(route) => {
              if (route === "Create") {
                push({ name: "Reader", story: createDummyStory() })
              } else if (route === "Search") {
                push({ name: "Search" })
              } else if (route === "Library") {
                push({ name: "Library" })
              } else if (route === "Profile") {
                push({ name: "Profile" })
              } else {
                setScreenStack([{ name: "Home" }])
              }
            }}
          />
        )}
      </View>
    </GestureHandlerRootView>
  )
}

function createDummyStory(): Story {
  return {
    id: "new-" + Date.now(),
    title: "Untitled Story",
    coverURL: "https://picsum.photos/seed/new/400/600",
    authorId: "current",
    authorName: "You",
    description: "Start writing your story...",
    tags: [],
    likesCount: 0,
    chaptersCount: 1,
    status: "ongoing",
    createdAt: Date.now(),
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  loading: { flex: 1, backgroundColor: "#0F0F0F" },
})
