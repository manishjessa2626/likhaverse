import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface Props {
  onGoogle: () => void
  onFacebook: () => void
  onEmail: () => void
  onPhone: () => void
  onLogin: () => void
}

export function WelcomeScreen({ onGoogle, onFacebook, onEmail, onPhone, onLogin }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>LikhaVerse</Text>
        <Text style={styles.tagline}>Where Stories Come Alive</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]} onPress={onGoogle}>
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialBtn, styles.facebookBtn]} onPress={onFacebook}>
          <Text style={styles.socialIcon}>f</Text>
          <Text style={styles.socialText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={[styles.socialBtn, styles.emailBtn]} onPress={onEmail}>
          <Text style={styles.socialIcon}>✉️</Text>
          <Text style={styles.socialText}>Continue with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialBtn, styles.phoneBtn]} onPress={onPhone}>
          <Text style={styles.socialIcon}>📱</Text>
          <Text style={styles.socialText}>Continue with Phone</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  top: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FF4D6D",
  },
  tagline: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
  },
  buttons: {
    gap: 12,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    gap: 10,
  },
  googleBtn: {
    backgroundColor: "#FFF",
  },
  facebookBtn: {
    backgroundColor: "#1877F2",
  },
  emailBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  phoneBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: "700",
  },
  socialText: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2C2C2E",
  },
  dividerText: {
    color: "#636366",
    fontSize: 12,
    marginHorizontal: 12,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 48,
  },
  bottomText: {
    color: "#8E8E93",
    fontSize: 14,
  },
  loginLink: {
    color: "#FF4D6D",
    fontSize: 14,
    fontWeight: "600",
  },
})
