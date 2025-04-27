"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Errore", "Per favore inserisci email e password")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      Alert.alert("Errore durante il login", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Bentornato</Text>
          <Text style={styles.subtitle}>Accedi al tuo account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="La tua email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="La tua password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Password dimenticata?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginButtonText}>{loading ? "Accesso in corso..." : "Accedi"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Non hai un account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupLink}>Registrati</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#34495e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#3498db",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  signupLink: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default LoginScreen
