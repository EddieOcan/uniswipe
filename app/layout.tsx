import './globals.css'
import 'react-native-web/dist/cjs/exports/AppRegistry/AppRegistry.js'
import 'react-native-web/dist/cjs/modules/normalizeColor/index.js'
import 'react-native-web/dist/cjs/exports/StyleSheet/css/index.js'

export const metadata = {
  title: 'UniSwipe - App per Studenti Universitari',
  description: 'Trova tutori, ricevi aiuto e connettiti con altri studenti universitari',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
} 