import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native"
import { useAuth } from "../context/AuthContext"
import { sendEmailOtp, verifyEmailOtp } from "../auth/email-otp"

interface Props {
  onBack: () => void
  onComplete: () => void
}

export function RegisterScreen({ onBack, onComplete }: Props) {
  const { createAccountWithEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [step, setStep] = useState<"form" | "otp">("form")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")

  const handleSendOtp = async () => {
    if (!email.trim() || !displayName.trim() || !username.trim()) {
      setError("Fill in all fields")
      return
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces")
      return
    }
    setLoading(true)
    setError("")
    try {
      await sendEmailOtp(email.trim())
      setStep("otp")
    } catch (e: any) {
      setError(e.message ?? "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code")
      return
    }
    setLoading(true)
    setError("")
    try {
      const valid = await verifyEmailOtp(email.trim(), code)
      if (!valid) {
        setError("Invalid or expired code")
        setLoading(false)
        return
      }
      // Create account with a temporary password
      const tempPassword = Math.random().toString(36).slice(-12)
      await createAccountWithEmail(email.trim(), tempPassword, displayName.trim(), username.trim().toLowerCase())
      onComplete()
    } catch (e: any) {
      setError(e.message ?? "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setStep("form")} style={styles.back}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Code sent to {email}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor="#636366"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#636366"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor="#636366"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#636366"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Code</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F", justifyContent: "center", paddingHorizontal: 32 },
  content: { paddingHorizontal: 0 },
  back: { width: 40, height: 40, justifyContent: "center", marginBottom: 16 },
  backArrow: { color: "#FF4D6D", fontSize: 32, lineHeight: 34 },
  title: { fontSize: 28, fontWeight: "800", color: "#FFF", marginBottom: 24 },
  subtitle: { fontSize: 14, color: "#8E8E93", textAlign: "center", marginBottom: 24 },
  error: {
    color: "#FF4D6D",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#FF4D6D20",
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    color: "#FFF",
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  codeInput: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    height: 56,
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF4D6D",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
})
