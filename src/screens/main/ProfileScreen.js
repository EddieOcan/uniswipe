"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const ProfileScreen = ({ navigation }) => {
  const { session, setSession } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tutorProfile, setTutorProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Check if user is a tutor
      if (profileData.is_tutor) {
        const { data: tutorData, error: tutorError } = await supabase
          .from("tutors")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (tutorError && tutorError.code !== "PGRST116") throw tutorError
        setTutorProfile(tutorData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setSession(null)
    } catch (error) {
      Alert.alert("Errore", "Si è verificato un errore durante il logout")
    }
  }

  const confirmSignOut = () => {
    Alert.alert("Logout", "Sei sicuro di voler uscire?", [
      {
        text: "Annulla",
        style: "cancel",
      },
      { text: "Logout", onPress: handleSignOut },
    ])
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilo</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image
            source={profile?.avatar_url ? { uri: profile.avatar_url } : require("../../../assets/icon.png")}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.full_name || "Nome Utente"}</Text>
            <Text style={styles.username}>@{profile?.username || "username"}</Text>
            {profile?.is_tutor && (
              <View style={styles.tutorBadge}>
                <Ionicons name="school" size={14} color="#fff" />
                <Text style={styles.tutorBadgeText}>Tutor</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile", { profile })}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Modifica</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#7f8c8d" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{session?.user?.email || "email@example.com"}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="school-outline" size={20} color="#7f8c8d" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Università</Text>
              <Text style={styles.infoValue}>{profile?.university || "Non specificata"}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="book-outline" size={20} color="#7f8c8d" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Facoltà</Text>
              <Text style={styles.infoValue}>{profile?.faculty || "Non specificata"}</Text>
            </View>
          </View>

          {profile?.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioLabel}>Bio</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}
        </View>

        {profile?.is_tutor && tutorProfile ? (
          <View style={styles.tutorSection}>
            <Text style={styles.sectionTitle}>Profilo Tutor</Text>

            <View style={styles.tutorInfo}>
              <View style={styles.tutorInfoItem}>
                <Text style={styles.tutorInfoLabel}>Tariffa oraria</Text>
                <Text style={styles.tutorInfoValue}>
                  {tutorProfile.hourly_rate ? `€${tutorProfile.hourly_rate}/ora` : "Non specificata"}
                </Text>
              </View>

              <View style={styles.tutorInfoItem}>
                <Text style={styles.tutorInfoLabel}>Valutazione</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#f1c40f" />
                  <Text style={styles.rating}>
                    {tutorProfile.rating.toFixed(1)} ({tutorProfile.rating_count})
                  </Text>
                </View>
              </View>

              <View style={styles.tutorInfoItem}>
                <Text style={styles.tutorInfoLabel}>Materie</Text>
                <View style={styles.subjectsContainer}>
                  {tutorProfile.subjects.map((subject, index) => (
                    <View key={index} style={styles.subjectTag}>
                      <Text style={styles.subjectText}>{subject}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.tutorInfoItem}>
                <Text style={styles.tutorInfoLabel}>Disponibilità</Text>
                <Text style={styles.tutorInfoValue}>{tutorProfile.availability || "Non specificata"}</Text>
              </View>
            </View>
          </View>
        ) : !profile?.is_tutor ? (
          <View style={styles.becomeTutorSection}>
            <Text style={styles.becomeTutorTitle}>Diventa un Tutor</Text>
            <Text style={styles.becomeTutorText}>Aiuta altri studenti e guadagna condividendo le tue conoscenze</Text>
            <TouchableOpacity style={styles.becomeTutorButton} onPress={() => navigation.navigate("BecomeTutor")}>
              <Text style={styles.becomeTutorButtonText}>Diventa Tutor</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  username: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
    width: 20,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
  },
  bioContainer: {
    marginTop: 10,
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#34495e",
  },
  tutorSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tutorInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
  },
  tutorInfoItem: {
    marginBottom: 15,
  },
  tutorInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  tutorInfoValue: {
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    marginLeft: 5,
  },
  subjectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  subjectTag: {
    backgroundColor: "#e8f4fc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  subjectText: {
    fontSize: 12,
    color: "#3498db",
  },
  becomeTutorSection: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  becomeTutorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  becomeTutorText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  becomeTutorButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  becomeTutorButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default ProfileScreen
