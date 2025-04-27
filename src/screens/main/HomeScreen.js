"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"
import HelpRequestCard from "../../components/HelpRequestCard"
import TutorCard from "../../components/TutorCard"

const HomeScreen = ({ navigation }) => {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [recentHelpRequests, setRecentHelpRequests] = useState([])
  const [topTutors, setTopTutors] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (session) {
      fetchProfile()
      fetchRecentHelpRequests()
      fetchTopTutors()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchRecentHelpRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("help_requests")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentHelpRequests(data)
    } catch (error) {
      console.error("Error fetching help requests:", error)
    }
  }

  const fetchTopTutors = async () => {
    try {
      const { data, error } = await supabase
        .from("tutors")
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, university, faculty)
        `)
        .order("rating", { ascending: false })
        .limit(5)

      if (error) throw error
      setTopTutors(data)
    } catch (error) {
      console.error("Error fetching tutors:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchProfile(), fetchRecentHelpRequests(), fetchTopTutors()])
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Ciao, {profile?.username || "Studente"}</Text>
        <Text style={styles.welcomeText}>Benvenuto su UniSwipe</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Richieste recenti</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate("HelpRequests")}>
              <Text style={styles.seeAllText}>Vedi tutte</Text>
              <Ionicons name="chevron-forward" size={16} color="#3498db" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
            {recentHelpRequests.length > 0 ? (
              recentHelpRequests.map((request) => (
                <HelpRequestCard
                  key={request.id}
                  request={request}
                  onPress={() => navigation.navigate("HelpRequestDetail", { requestId: request.id })}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nessuna richiesta recente</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tutor in evidenza</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate("Tutors")}>
              <Text style={styles.seeAllText}>Vedi tutti</Text>
              <Ionicons name="chevron-forward" size={16} color="#3498db" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
            {topTutors.length > 0 ? (
              topTutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  onPress={() => navigation.navigate("TutorDetail", { tutorId: tutor.id })}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nessun tutor disponibile</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("CreateHelpRequest")}>
            <Ionicons name="help-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Chiedi aiuto</Text>
          </TouchableOpacity>

          {!profile?.is_tutor && (
            <TouchableOpacity
              style={[styles.actionButton, styles.tutorButton]}
              onPress={() => navigation.navigate("BecomeTutor")}
            >
              <Ionicons name="school" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Diventa tutor</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#3498db",
    marginRight: 5,
  },
  horizontalScrollView: {
    marginBottom: 10,
  },
  emptyState: {
    width: 300,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginRight: 15,
  },
  emptyStateText: {
    color: "#7f8c8d",
  },
  actionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  actionButton: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  tutorButton: {
    backgroundColor: "#2ecc71",
    marginRight: 0,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 10,
  },
})

export default HomeScreen
