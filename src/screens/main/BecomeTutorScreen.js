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

const BecomeTutorScreen = ({ navigation }) => {
  const { session } = useAuth()
  const [subjects, setSubjects] = useState([""])
  const [hourlyRate, setHourlyRate] = useState("")
  const [availability, setAvailability] = useState("")
  const [loading, setLoading] = useState(false)

  const addSubject = () => {
    setSubjects([...subjects, ""])
  }

  const removeSubject = (index) => {
    const newSubjects = [...subjects]
    newSubjects.splice(index, 1)
    setSubjects(newSubjects)
  }

  const updateSubject = (text, index) => {
    const newSubjects = [...subjects]
    newSubjects[index] = text
    setSubjects(newSubjects)
  }

  const handleSubmit = async () => {
    // Validate subjects
    const filteredSubjects = subjects.filter((subject) => subject.trim() !== "")
    if (filteredSubjects.length === 0) {
      Alert.alert("Errore", "Devi inserire almeno una materia")
      return
    }

    // Validate hourly rate
    const rate = Number.parseFloat(hourlyRate.replace(",", "."))
    if (hourlyRate && (isNaN(rate) || rate <= 0)) {
      Alert.alert("Errore", "La tariffa oraria deve essere un numero positivo")
      return
    }

    setLoading(true)

    try {
      // First update the profile to mark as tutor
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_tutor: true,
        })
        .eq("id", session.user.id)

      if (profileError) throw profileError

      // Then create the tutor profile
      const { error: tutorError } = await supabase.from("tutors").insert([
        {
          user_id: session.user.id,
          subjects: filteredSubjects,
          hourly_rate: hourlyRate ? rate : null,
          availability,
          rating: 0,
          rating_count: 0,
        },
      ])

      if (tutorError) throw tutorError

      Alert.alert("Successo", "Sei diventato un tutor! Ora puoi aiutare altri studenti.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("ProfileScreen"),
        },
      ])
    } catch (error) {
      console.error("Error becoming tutor:", error)
      Alert.alert("Errore", "Si è verificato un errore durante la creazione del profilo tutor")
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
        <View style={styles.header}>
          <Ionicons name="school" size={60} color="#3498db" />
          <Text style={styles.title}>Diventa un Tutor</Text>
          <Text style={styles.subtitle}>Aiuta altri studenti e guadagna condividendo le tue conoscenze</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Materie</Text>
            <Text style={styles.helperText}>Inserisci le materie in cui puoi offrire ripetizioni</Text>

            {subjects.map((subject, index) => (
              <View key={index} style={styles.subjectInputContainer}>
                <TextInput
                  style={styles.subjectInput}
                  placeholder={`Materia ${index + 1}`}
                  value={subject}
                  onChangeText={(text) => updateSubject(text, index)}
                />
                {subjects.length > 1 && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeSubject(index)}>
                    <Ionicons name="close-circle" size={24} color="#e74c3c" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addSubject}>
              <Ionicons name="add-circle-outline" size={20} color="#3498db" />
              <Text style={styles.addButtonText}>Aggiungi materia</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tariffa oraria (€)</Text>
            <Text style={styles.helperText}>Lascia vuoto se preferisci concordare il prezzo con gli studenti</Text>
            <TextInput
              style={styles.input}
              placeholder="Es. 15"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Disponibilità</Text>
            <Text style={styles.helperText}>Indica quando sei disponibile per le ripetizioni</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Es. Lunedì e Mercoledì pomeriggio, weekend..."
              value={availability}
              onChangeText={setAvailability}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#3498db" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Diventando tutor, il tuo profilo sarà visibile nella bacheca dei tutor e gli studenti potranno contattarti
              per richiedere ripetizioni.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelButtonText}>Annulla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? "Creazione..." : "Diventa Tutor"}</Text>
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
  header: {
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#34495e",
  },
  helperText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 10,
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
    minHeight: 80,
    paddingTop: 12,
  },
  subjectInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  subjectInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  addButtonText: {
    color: "#3498db",
    marginLeft: 5,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#e8f4fc",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
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
    backgroundColor: "#2ecc71",
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

export default BecomeTutorScreen
