import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const HelpRequestCard = ({ request, onPress }) => {
  // Format date to display in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.subject}>{request.subject}</Text>
        <Text style={styles.date}>{formatDate(request.created_at)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {request.title}
      </Text>

      <View style={styles.examContainer}>
        <Ionicons name="school-outline" size={16} color="#7f8c8d" />
        <Text style={styles.exam}>{request.exam}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {request.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.username}>@{request.profiles?.username || "utente"}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
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
    fontSize: 16,
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
})

export default HelpRequestCard
