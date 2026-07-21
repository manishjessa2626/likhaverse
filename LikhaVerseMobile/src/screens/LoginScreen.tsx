import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { useAuth } from "../context/AuthContext"

interface Props {
  onGoBack: () => void
  onOtpSent: (email: string) => void
}

export function LoginScreen({ onGoBack, onOtpSent }: Props) {
  const { signInWithEmailOtp, sendEmailOtpCode } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"otp" | "password">("otp")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Enter your email address")
      return
    }
    setLoading(true)
    setError("")
    try {
      await sendEmailOtpCode(email.trim())
      setOtpSent(true)
      onOtpSent(email.trim())
    } catch (e: any) {
      setError(e.message ?? "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password) {
      setError("Fill in all fields")
      return
    }
    setLoading(true)
    setError("")
    try {
      await signInWithEmailOtp(email.trim(), "000000") // Placeholder — use OTP
    } catch (e: any) {
      setError(e.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onGoBack} style={styles.back}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Log In</Text>

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

        {mode === "password" && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#636366"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        )}

        {mode === "otp" ? (
          otpSent ? (
            <Text style={styles.info}>Code sent to {email}. Check the console for the code.</Text>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePasswordLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setMode(mode === "otp" ? "password" : "otp")}
          style={styles.switchMode}
        >
          <Text style={styles.switchText}>
            {mode === "otp" ? "Use password instead" : "Use OTP instead"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F", justifyContent: "center" },
  content: { paddingHorizontal: 32 },
  back: { width: 40, height: 40, justifyContent: "center", marginBottom: 16 },
  backArrow: { color: "#FF4D6D", fontSize: 32, lineHeight: 34 },
  title: { fontSize: 28, fontWeight: "800", color: "#FFF", marginBottom: 24 },
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
  info: {
    color: "#8E8E93",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#1C1C1E",
    paddingVertical: 12,
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
  button: {
    backgroundColor: "#FF4D6D",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  switchMode: { marginTop: 16, alignItems: "center" },
  switchText: { color: "#8E8E93", fontSize: 13 },
})
