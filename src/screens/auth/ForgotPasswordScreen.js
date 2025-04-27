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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Errore", "Per favore inserisci la tua email")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "uniswipe://reset-password",
      })

      if (error) throw error

      Alert.alert("Email inviata", "Controlla la tua email per le istruzioni su come reimpostare la password.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ])
    } catch (error) {
      Alert.alert("Errore", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Password dimenticata?</Text>
        <Text style={styles.subtitle}>Inserisci la tua email per reimpostare la password</Text>
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

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} disabled={loading}>
          <Text style={styles.resetButtonText}>{loading ? "Invio in corso..." : "Reimposta password"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
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
    marginBottom: 20,
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
  resetButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ForgotPasswordScreen
