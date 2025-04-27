"use client"

import "react-native-url-polyfill/auto"
import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import { View, Text, StyleSheet } from "react-native"
import { AuthProvider } from "./src/context/AuthContext"
import { supabase } from "./src/lib/supabase"
import AuthStack from "./src/navigation/AuthStack"
import MainStack from "./src/navigation/MainStack"
import LoadingScreen from "./src/screens/LoadingScreen"

const Stack = createNativeStackNavigator()

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Rimuoviamo il controllo delle variabili d'ambiente per eseguire l'app in modalità test
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setLoading(false)
      })

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    } catch (err) {
      console.error("Error initializing Supabase:", err)
      setError("Errore di inizializzazione")
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Riavvia l'applicazione o contatta il supporto</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <AuthProvider value={{ session, setSession }}>
        <StatusBar style="auto" />
        {session && session.user ? <MainStack /> : <AuthStack />}
      </AuthProvider>
    </NavigationContainer>
  )
}

// Aggiungiamo gli stili per la schermata di errore
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 10,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
})
