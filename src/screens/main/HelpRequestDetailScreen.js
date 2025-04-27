"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const HelpRequestDetailScreen = ({ route, navigation }) => {
  const { requestId } = route.params
  const { session } = useAuth()
  const [request, setRequest] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchRequestDetails()
  }, [requestId])

  const fetchRequestDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("help_requests")
        .select(
          `
          *,
          profiles:user_id (id, username, full_name, avatar_url, university, faculty, is_tutor)
        `,
        )
        .eq("id", requestId)
        .single()

      if (error) throw error

      setRequest(data)
      setAuthor(data.profiles)
      setIsOwner(data.user_id === session.user.id)
    } catch (error) {
      console.error("Error fetching request details:", error)
      Alert.alert("Errore", "Impossibile caricare i dettagli della richiesta")
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleContactPress = async () => {
    try {
      // Check if a conversation already exists between these users
      const { data: existingParticipations, error: participationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", session.user.id)

      if (participationsError) throw participationsError

      if (existingParticipations.length > 0) {
        const conversationIds = existingParticipations.map((p) => p.conversation_id)

        const { data: otherParticipations, error: otherParticipationsError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", author.id)
          .in("conversation_id", conversationIds)

        if (otherParticipationsError) throw otherParticipationsError

        if (otherParticipations.length > 0) {
          // Conversation already exists, navigate to it
          navigation.navigate("Messages", {
            screen: "Chat",
            params: {
              conversationId: otherParticipations[0].conversation_id,
              participantId: author.id,
              name: author.full_name || author.username,
            },
          })
          return
        }
      }

      // Create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .insert([{}])
        .select()

      if (conversationError) throw conversationError

      const conversationId = conversationData[0].id

      // Add participants
      const { error: participantsError } = await supabase.from("conversation_participants").insert([
        {
          conversation_id: conversationId,
          user_id: session.user.id,
        },
        {
          conversation_id: conversationId,
          user_id: author.id,
        },
      ])

      if (participantsError) throw participantsError

      // Send initial message
      const initialMessage = `Ciao! Ti contatto riguardo la tua richiesta: "${request.title}"`
      const { error: messageError } = await supabase.from("messages").insert([
        {
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: initialMessage,
        },
      ])

      if (messageError) throw messageError

      // Navigate to the chat
      navigation.navigate("Messages", {
        screen: "Chat",
        params: {
          conversationId,
          participantId: author.id,
          name: author.full_name || author.username,
        },
      })
    } catch (error) {
      console.error("Error creating conversation:", error)
      Alert.alert("Errore", "Si è verificato un errore durante la creazione della conversazione")
    }
  }

  const handleCloseRequest = async () => {
    Alert.alert(
      "Chiudi richiesta",
      "Sei sicuro di voler chiudere questa richiesta? Non sarà più visibile nella bacheca.",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Chiudi",
          onPress: async () => {
            try {
              const { error } = await supabase.from("help_requests").update({ status: "closed" }).eq("id", requestId)

              if (error) throw error

              Alert.alert("Successo", "La richiesta è stata chiusa", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ])
            } catch (error) {
              console.error("Error closing request:", error)
              Alert.alert("Errore", "Si è verificato un errore durante la chiusura della richiesta")
            }
          },
        },
      ],
    )
  }

  const handleDeleteRequest = async () => {
    Alert.alert(
      "Elimina richiesta",
      "Sei sicuro di voler eliminare questa richiesta? Questa azione non può essere annullata.",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from("help_requests").delete().eq("id", requestId)

              if (error) throw error

              Alert.alert("Successo", "La richiesta è stata eliminata", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ])
            } catch (error) {
              console.error("Error deleting request:", error)
              Alert.alert("Errore", "Si è verificato un errore durante l'eliminazione della richiesta")
            }
          },
        },
      ],
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{request.subject}</Text>
            <Text style={styles.date}>{formatDate(request.created_at)}</Text>
          </View>
          <Text style={styles.title}>{request.title}</Text>
          <View style={styles.examContainer}>
            <Ionicons name="school-outline" size={16} color="#7f8c8d" />
            <Text style={styles.exam}>{request.exam}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Descrizione</Text>
          <Text style={styles.description}>{request.description}</Text>
        </View>

        <View style={styles.authorContainer}>
          <Text style={styles.authorTitle}>Pubblicato da</Text>
          <View style={styles.authorCard}>
            <Image
              source={author?.avatar_url ? { uri: author.avatar_url } : require("../../../assets/icon.png")}
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{author?.full_name || "Utente"}</Text>
              <Text style={styles.authorUsername}>@{author?.username || "username"}</Text>
              <Text style={styles.authorUniversity}>
                {author?.university || "Università"} - {author?.faculty || "Facoltà"}
              </Text>
            </View>
            {author?.is_tutor && (
              <View style={styles.tutorBadge}>
                <Ionicons name="school" size={14} color="#fff" />
                <Text style={styles.tutorBadgeText}>Tutor</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isOwner ? (
          <>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteRequest}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              <Text style={styles.deleteButtonText}>Elimina</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseRequest}>
              <Text style={styles.closeButtonText}>Chiudi richiesta</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
            <Text style={styles.contactButtonText}>Contatta</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  subjectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subject: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  examContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  exam: {
    fontSize: 16,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  descriptionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
  },
  authorContainer: {
    padding: 20,
  },
  authorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  authorCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
  },
  authorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  authorUsername: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  authorUniversity: {
    fontSize: 14,
    color: "#34495e",
  },
  tutorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  tutorBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 3,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  contactButton: {
    flex: 1,
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e74c3c",
    marginRight: 10,
  },
  deleteButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#7f8c8d",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default HelpRequestDetailScreen
