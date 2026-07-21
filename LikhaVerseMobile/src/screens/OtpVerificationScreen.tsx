import { useState, useEffect, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { useAuth } from "../context/AuthContext"

interface Props {
  email: string
  onVerified: () => void
  onBack: () => void
}

export function OtpVerificationScreen({ email, onVerified, onBack }: Props) {
  const { signInWithEmailOtp } = useAuth()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(30)
  const inputRefs = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Enter the 6-digit code")
      return
    }
    setLoading(true)
    setError("")
    try {
      await signInWithEmailOtp(email, fullCode)
      onVerified()
    } catch (e: any) {
      setError(e.message ?? "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Enter Code</Text>
      <Text style={styles.subtitle}>Sent to {email}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.codeRow}>
        {code.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref }}
            style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
            value={digit}
            onChangeText={(t) => handleCodeChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resend}
        onPress={() => setCooldown(30)}
        disabled={cooldown > 0}
      >
        <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
          {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F", justifyContent: "center", paddingHorizontal: 32 },
  back: { position: "absolute", top: 60, left: 16, width: 40, height: 40, justifyContent: "center" },
  backArrow: { color: "#FF4D6D", fontSize: 32, lineHeight: 34 },
  title: { fontSize: 28, fontWeight: "800", color: "#FFF", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#8E8E93", textAlign: "center", marginBottom: 32 },
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
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  codeInputFilled: {
    borderColor: "#FF4D6D",
    backgroundColor: "#FF4D6D20",
  },
  button: {
    backgroundColor: "#FF4D6D",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  resend: { marginTop: 20, alignItems: "center" },
  resendText: { color: "#8E8E93", fontSize: 14 },
  resendDisabled: { color: "#3A3A3C" },
})
