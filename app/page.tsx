'use client'

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import App from '../App'

export default function Page() {
  return (
    <View style={styles.container}>
      <App />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
    width: '100vw',
  },
}) 