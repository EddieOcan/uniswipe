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

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [university, setUniversity] = useState("")
  const [faculty, setFaculty] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async () => {
    if (!fullName || !username || !email || !password || !university || !faculty) {
      Alert.alert("Errore", "Per favore compila tutti i campi")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            university,
            faculty,
          },
        },
      })

      if (error) throw error

      Alert.alert("Registrazione completata", "Controlla la tua email per confermare la registrazione.")
    } catch (error) {
      Alert.alert("Errore durante la registrazione", error.message)
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
          <Text style={styles.title}>Crea un account</Text>
          <Text style={styles.subtitle}>Unisciti alla community di UniSwipe</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Il tuo nome e cognome"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Scegli un username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

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
                placeholder="Crea una password"
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Università</Text>
            <TextInput
              style={styles.input}
              placeholder="La tua università"
              value={university}
              onChangeText={setUniversity}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Facoltà</Text>
            <TextInput style={styles.input} placeholder="La tua facoltà" value={faculty} onChangeText={setFaculty} />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
            <Text style={styles.signupButtonText}>{loading ? "Registrazione in corso..." : "Registrati"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Hai già un account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Accedi</Text>
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
  signupButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  loginLink: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default SignupScreen
