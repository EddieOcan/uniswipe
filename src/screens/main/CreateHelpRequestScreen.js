"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const CreateHelpRequestScreen = ({ navigation }) => {
  const { session } = useAuth()
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [exam, setExam] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title || !subject || !exam || !description) {
      Alert.alert("Errore", "Per favore compila tutti i campi")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.from("help_requests").insert([
        {
          user_id: session.user.id,
          title,
          subject,
          exam,
          description,
          status: "open",
        },
      ])

      if (error) throw error

      Alert.alert("Successo", "La tua richiesta è stata pubblicata", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Error creating help request:", error)
      Alert.alert("Errore", "Si è verificato un errore durante la pubblicazione della richiesta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Titolo</Text>
            <TextInput
              style={styles.input}
              placeholder="Es. Aiuto con gli integrali"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Materia</Text>
            <TextInput
              style={styles.input}
              placeholder="Es. Matematica"
              value={subject}
              onChangeText={setSubject}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Esame</Text>
            <TextInput
              style={styles.input}
              placeholder="Es. Analisi I"
              value={exam}
              onChangeText={setExam}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrizione</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrivi dettagliatamente di cosa hai bisogno..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#3498db" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Consiglio: Più dettagli fornisci, maggiori sono le possibilità di ricevere l'aiuto di cui hai bisogno.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelButtonText}>Annulla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? "Pubblicazione..." : "Pubblica richiesta"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
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
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "right",
    marginTop: 5,
  },
  tipContainer: {
    flexDirection: "row",
    backgroundColor: "#e8f4fc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3498db",
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default CreateHelpRequestScreen
