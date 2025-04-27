import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const TutorCard = ({ tutor, onPress }) => {
  // Get the first 3 subjects to display
  const displaySubjects = tutor.subjects.slice(0, 3)
  const hasMoreSubjects = tutor.subjects.length > 3

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Image
          source={tutor.profiles?.avatar_url ? { uri: tutor.profiles.avatar_url } : require("../../assets/icon.png")}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{tutor.profiles?.full_name || "Tutor"}</Text>
          <Text style={styles.username}>@{tutor.profiles?.username || "utente"}</Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#f1c40f" />
        <Text style={styles.rating}>
          {tutor.rating.toFixed(1)} ({tutor.rating_count})
        </Text>
      </View>

      <View style={styles.universityContainer}>
        <Ionicons name="school-outline" size={16} color="#7f8c8d" />
        <Text style={styles.universityText} numberOfLines={1}>
          {tutor.profiles?.university || "Università"} - {tutor.profiles?.faculty || "Facoltà"}
        </Text>
      </View>

      <View style={styles.subjectsContainer}>
        <Text style={styles.subjectsTitle}>Materie:</Text>
        <View style={styles.subjects}>
          {displaySubjects.map((subject, index) => (
            <View key={index} style={styles.subjectTag}>
              <Text style={styles.subjectText}>{subject}</Text>
            </View>
          ))}
          {hasMoreSubjects && (
            <View style={styles.moreSubjectsTag}>
              <Text style={styles.moreSubjectsText}>+{tutor.subjects.length - 3}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{tutor.hourly_rate ? `€${tutor.hourly_rate}/ora` : "Prezzo da concordare"}</Text>
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
    marginBottom: 10,
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
})

export default TutorCard
