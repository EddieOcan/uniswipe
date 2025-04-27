import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { StatusBar } from "expo-status-bar"

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
        <Image source={require("../../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>UniSwipe</Text>
        <Text style={styles.tagline}>Ripetizioni tra studenti universitari</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Accedi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupButtonText}>Registrati</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 50,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#3498db",
  },
  signupButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3498db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default WelcomeScreen
