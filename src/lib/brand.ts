/**
 * LikhaVerse Brand Design Tokens
 *
 * This file defines the core design language.
 * Use these tokens for consistent styling across all components.
 *
 * Color: Filipino lilac/sunset inspired palette
 * Typography: Clean sans-serif UI, serif reading
 * Shape: Soft glass morphism, rounded corners
 * Motion: Gentle, purposeful animations
 * Voice: Creative, warm, premium
 */

export const BRAND = {
  name: "LikhaVerse",
  tagline: "Where stories come to life",
  description: "A creative ecosystem for readers, authors, and filmmakers",

  colors: {
    // Primary purple palette
    purple: {
      50: "#f3eefb",
      100: "#e8dff5",
      200: "#d4c5f0", // body background
      300: "#b8a0e0",
      400: "#9b7fd0",
      500: "#7c5fbf",
      600: "#5c3fa8", // primary button
      700: "#4a2d8f",
      800: "#3a1f75",
      900: "#2a1455",
    },
    // Warm sunset accent
    sunset: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    // Semantic
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#6366f1",
  },

  glass: {
    light: {
      bg: "rgba(255, 255, 255, 0.7)",
      border: "rgba(180, 160, 220, 0.4)",
      blur: "16px",
    },
    dark: {
      bg: "rgba(39, 39, 42, 0.7)",
      border: "rgba(63, 63, 70, 0.6)",
      blur: "16px",
    },
  },

  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    "2xl": "28px",
  },

  shadows: {
    glass: "0 2px 12px rgba(90, 60, 160, 0.08)",
    glassLg: "0 8px 32px rgba(90, 60, 160, 0.12)",
    elevated: "0 4px 20px rgba(90, 60, 160, 0.15)",
    glassDark: "0 2px 12px rgba(0, 0, 0, 0.2)",
    elevatedDark: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },

  transitions: {
    fast: "150ms ease-out",
    base: "200ms ease-out",
    slow: "350ms ease-out",
  },

  typography: {
    display: "var(--font-geist-sans)",
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
    serif: "Georgia, 'Times New Roman', serif",
  },

  // Brand voice examples (for copywriting)
  voice: {
    taglines: [
      "Where stories come to life",
      "Every story is a universe",
      "Write. Direct. Inspire.",
      "Create worlds without limits",
    ],
    tone: "warm, creative, premium, Filipino-inspired",
  },
} as const
