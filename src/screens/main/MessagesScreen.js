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
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const MessagesScreen = ({ navigation }) => {
  const { session } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  const fetchConversations = async () => {
    try {
      setLoading(true)

      // Get all conversations the user is part of
      const { data: participations, error: participationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", session.user.id)

      if (participationsError) throw participationsError

      if (participations.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const conversationIds = participations.map((p) => p.conversation_id)

      // For each conversation, get the other participant and the last message
      const conversationsWithDetails = await Promise.all(
        conversationIds.map(async (conversationId) => {
          // Get other participant
          const { data: participants, error: participantsError } = await supabase
            .from("conversation_participants")
            .select(
              `
              user_id,
              profiles:user_id (id, username, full_name, avatar_url)
            `,
            )
            .eq("conversation_id", conversationId)
            .neq("user_id", session.user.id)
            .single()

          if (participantsError) throw participantsError

          // Get last message
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (lastMessageError && lastMessageError.code !== "PGRST116") {
            // PGRST116 is the error code for "no rows returned"
            throw lastMessageError
          }

          // Get unread count
          const { count, error: countError } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("conversation_id", conversationId)
            .eq("read", false)
            .neq("sender_id", session.user.id)

          if (countError) throw countError

          return {
            id: conversationId,
            participant: participants.profiles,
            lastMessage: lastMessage || null,
            unreadCount: count || 0,
          }
        }),
      )

      // Sort by last message date (most recent first)
      const sortedConversations = conversationsWithDetails.sort((a, b) => {
        if (!a.lastMessage) return 1
        if (!b.lastMessage) return -1
        return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      })

      setConversations(sortedConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchConversations()
    setRefreshing(false)
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      // Yesterday
      return "Ieri"
    } else if (diffDays < 7) {
      // This week, show day name
      return date.toLocaleDateString("it-IT", { weekday: "short" })
    } else {
      // Older, show date
      return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" })
    }
  }

  const renderConversation = ({ item }) => {
    const participantName = item.participant?.full_name || item.participant?.username || "Utente"

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate("Chat", {
            conversationId: item.id,
            participantId: item.participant.id,
            name: participantName,
          })
        }
      >
        <Image
          source={
            item.participant?.avatar_url ? { uri: item.participant.avatar_url } : require("../../../assets/icon.png")
          }
          style={styles.avatar}
        />

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName} numberOfLines={1}>
              {participantName}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.lastMessage?.created_at)}</Text>
          </View>

          <View style={styles.messagePreviewContainer}>
            <Text style={styles.messagePreview} numberOfLines={1}>
              {item.lastMessage?.content || "Nessun messaggio"}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messaggi</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nessuna conversazione</Text>
              <Text style={styles.emptySubtext}>Le tue conversazioni con altri utenti appariranno qui</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  messagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreview: {
    fontSize: 14,
    color: "#7f8c8d",
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
})

export default MessagesScreen
