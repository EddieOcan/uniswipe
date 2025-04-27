"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const TutorDetailScreen = ({ route, navigation }) => {
  const { tutorId } = route.params
  const { session } = useAuth()
  const [tutor, setTutor] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  useEffect(() => {
    fetchTutorDetails()
  }, [tutorId])

  const fetchTutorDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tutors")
        .select(
          `
          *,
          profiles:user_id (id, username, full_name, avatar_url, university, faculty, bio)
        `,
        )
        .eq("id", tutorId)
        .single()

      if (error) throw error

      setTutor(data)
      setProfile(data.profiles)
      setIsCurrentUser(data.user_id === session.user.id)
    } catch (error) {
      console.error("Error fetching tutor details:", error)
      Alert.alert("Errore", "Impossibile caricare i dettagli del tutor")
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
          .eq("user_id", profile.id)
          .in("conversation_id", conversationIds)

        if (otherParticipationsError) throw otherParticipationsError

        if (otherParticipations.length > 0) {
          // Conversation already exists, navigate to it
          navigation.navigate("Messages", {
            screen: "Chat",
            params: {
              conversationId: otherParticipations[0].conversation_id,
              participantId: profile.id,
              name: profile.full_name || profile.username,
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
          user_id: profile.id,
        },
      ])

      if (participantsError) throw participantsError

      // Send initial message
      const initialMessage = `Ciao! Sono interessato alle tue ripetizioni.`
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
          participantId: profile.id,
          name: profile.full_name || profile.username,
        },
      })
    } catch (error) {
      console.error("Error creating conversation:", error)
      Alert.alert("Errore", "Si è verificato un errore durante la creazione della conversazione")
    }
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
          <Image
            source={profile?.avatar_url ? { uri: profile.avatar_url } : require("../../../assets/icon.png")}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.full_name || "Tutor"}</Text>
          <Text style={styles.username}>@{profile?.username || "username"}</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#f1c40f" />
            <Text style={styles.rating}>
              {tutor.rating.toFixed(1)} ({tutor.rating_count})
            </Text>
          </View>

          <View style={styles.universityContainer}>
            <Ionicons name="school-outline" size={18} color="#7f8c8d" />
            <Text style={styles.universityText}>
              {profile?.university || "Università"} - {profile?.faculty || "Facoltà"}
            </Text>
          </View>
        </View>

        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materie</Text>
          <View style={styles.subjectsContainer}>
            {tutor.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectTag}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tariffa</Text>
          <Text style={styles.priceText}>
            {tutor.hourly_rate ? `€${tutor.hourly_rate}/ora` : "Prezzo da concordare"}
          </Text>
        </View>

        {tutor.availability && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibilità</Text>
            <Text style={styles.availabilityText}>{tutor.availability}</Text>
          </View>
        )}
      </ScrollView>

      {!isCurrentUser && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
            <Text style={styles.contactButtonText}>Contatta</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rating: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 5,
  },
  universityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  universityText: {
    fontSize: 16,
    color: "#34495e",
    marginLeft: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
  },
  subjectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subjectTag: {
    backgroundColor: "#e8f4fc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 14,
    color: "#3498db",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  availabilityText: {
    fontSize: 16,
    color: "#34495e",
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  contactButton: {
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
})

export default TutorDetailScreen
