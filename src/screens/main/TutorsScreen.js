"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"

const TutorsScreen = ({ navigation }) => {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTutors()
  }, [])

  const fetchTutors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tutors")
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url, university, faculty)
        `)
        .order("rating", { ascending: false })

      if (error) throw error
      setTutors(data)
    } catch (error) {
      console.error("Error fetching tutors:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTutors()
    setRefreshing(false)
  }

  const filteredTutors = tutors.filter((tutor) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      tutor.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      tutor.profiles?.username?.toLowerCase().includes(searchLower) ||
      tutor.profiles?.university?.toLowerCase().includes(searchLower) ||
      tutor.profiles?.faculty?.toLowerCase().includes(searchLower) ||
      tutor.subjects.some((subject) => subject.toLowerCase().includes(searchLower))
    )
  })

  const renderTutor = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.tutorCard}
        onPress={() => navigation.navigate("TutorDetail", { tutorId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Image
            source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require("../../../assets/icon.png")}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{item.profiles?.full_name || "Tutor"}</Text>
            <Text style={styles.username}>@{item.profiles?.username || "utente"}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Text style={styles.rating}>
              {item.rating.toFixed(1)} ({item.rating_count})
            </Text>
          </View>
        </View>

        <View style={styles.universityContainer}>
          <Ionicons name="school-outline" size={16} color="#7f8c8d" />
          <Text style={styles.universityText} numberOfLines={1}>
            {item.profiles?.university || "Università"} - {item.profiles?.faculty || "Facoltà"}
          </Text>
        </View>

        <View style={styles.subjectsContainer}>
          <Text style={styles.subjectsTitle}>Materie:</Text>
          <View style={styles.subjects}>
            {item.subjects.slice(0, 3).map((subject, index) => (
              <View key={index} style={styles.subjectTag}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
            {item.subjects.length > 3 && (
              <View style={styles.moreSubjectsTag}>
                <Text style={styles.moreSubjectsText}>+{item.subjects.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.hourly_rate ? `€${item.hourly_rate}/ora` : "Prezzo da concordare"}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tutor disponibili</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca per nome, università o materia..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={filteredTutors}
          renderItem={renderTutor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nessun tutor trovato</Text>
            </View>
          }
        />
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 20,
  },
  tutorCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  username: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: "#34495e",
    marginLeft: 5,
  },
  universityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  universityText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
    flex: 1,
  },
  subjectsContainer: {
    marginBottom: 15,
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  subjects: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  moreSubjectsTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 5,
  },
  moreSubjectsText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 10,
  },
})

export default TutorsScreen
