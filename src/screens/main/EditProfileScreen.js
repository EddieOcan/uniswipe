"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const EditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params
  const { session } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [university, setUniversity] = useState(profile?.university || "")
  const [faculty, setFaculty] = useState(profile?.faculty || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    requestMediaLibraryPermissions()
  }, [])

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permesso negato", "È necessario concedere l'accesso alla galleria per cambiare l'avatar")
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        const imageUri = result.assets[0].uri
        await uploadAvatar(imageUri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Errore", "Si è verificato un errore durante la selezione dell'immagine")
    }
  }

  const uploadAvatar = async (uri) => {
    try {
      setUploading(true)

      // Convert image to blob
      const response = await fetch(uri)
      const blob = await response.blob()

      // Upload to Supabase Storage
      const fileExt = uri.split(".").pop()
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, blob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      Alert.alert("Errore", "Si è verificato un errore durante il caricamento dell'avatar")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!fullName || !username) {
      Alert.alert("Errore", "Nome completo e username sono campi obbligatori")
      return
    }

    try {
      setSaving(true)

      // Check if username is already taken (if changed)
      if (username !== profile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .neq("id", session.user.id)
          .single()

        if (checkError && checkError.code !== "PGRST116") throw checkError
        if (existingUser) {
          Alert.alert("Errore", "Questo username è già in uso")
          setSaving(false)
          return
        }
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          username,
          bio,
          university,
          faculty,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        })
        .eq("id", session.user.id)

      if (error) throw error

      Alert.alert("Successo", "Profilo aggiornato con successo", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Errore", "Si è verificato un errore durante l'aggiornamento del profilo")
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.avatarContainer}>
          {uploading ? (
            <View style={styles.avatarPlaceholder}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          ) : (
            <Image
              source={avatarUrl ? { uri: avatarUrl } : require("../../../assets/icon.png")}
              style={styles.avatar}
            />
          )}
          <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage} disabled={uploading}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
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
              placeholder="Il tuo username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Raccontaci qualcosa di te..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancelButtonText}>Annulla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Salvataggio..." : "Salva"}</Text>
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
  avatarContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3498db",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
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
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "right",
    marginTop: 5,
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
  saveButton: {
    flex: 2,
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default EditProfileScreen
