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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const HelpRequestsScreen = ({ navigation }) => {
  const { session } = useAuth()
  const [helpRequests, setHelpRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchHelpRequests()
  }, [])

  const fetchHelpRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("help_requests")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false })

      if (error) throw error
      setHelpRequests(data)
    } catch (error) {
      console.error("Error fetching help requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchHelpRequests()
    setRefreshing(false)
  }

  const filteredRequests = helpRequests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.exam.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderHelpRequest = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate("HelpRequestDetail", { requestId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.examContainer}>
          <Ionicons name="school-outline" size={16} color="#7f8c8d" />
          <Text style={styles.exam}>{item.exam}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.username}>@{item.profiles?.username || "utente"}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Richieste di aiuto</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreateHelpRequest")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca per titolo, materia o esame..."
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
          data={filteredRequests}
          renderItem={renderHelpRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nessuna richiesta trovata</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate("CreateHelpRequest")}>
                <Text style={styles.emptyButtonText}>Crea una richiesta</Text>
              </TouchableOpacity>
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
  createButton: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  requestCard: {
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subject: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  examContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  exam: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  username: {
    fontSize: 12,
    color: "#7f8c8d",
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})

export default HelpRequestsScreen
