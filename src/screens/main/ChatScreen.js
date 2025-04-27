"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const ChatScreen = ({ route }) => {
  const { conversationId, participantId } = route.params
  const { session } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const flatListRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    markMessagesAsRead()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new
          setMessages((prevMessages) => [...prevMessages, newMessage])
          if (newMessage.sender_id !== session.user.id) {
            markMessageAsRead(newMessage.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [conversationId])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .eq("sender_id", participantId)
        .eq("read", false)

      if (error) throw error
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const markMessageAsRead = async (messageId) => {
    try {
      const { error } = await supabase.from("messages").update({ read: true }).eq("id", messageId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const { error } = await supabase.from("messages").insert([
        {
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: newMessage.trim(),
        },
      ])

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender_id === session.user.id

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, isCurrentUser ? styles.currentUserTime : styles.otherUserTime]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Scrivi un messaggio..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={sending || !newMessage.trim()}>
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  currentUserBubble: {
    backgroundColor: "#3498db",
  },
  otherUserBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: "#fff",
  },
  otherUserText: {
    color: "#34495e",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  currentUserTime: {
    color: "#7f8c8d",
    textAlign: "right",
  },
  otherUserTime: {
    color: "#7f8c8d",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
})

export default ChatScreen
