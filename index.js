import { registerRootComponent } from "expo"
import { AppRegistry } from 'react-native'
import App from "./App"

// Controllo se siamo in ambiente web
if (typeof window !== 'undefined' && window.document) {
  AppRegistry.registerComponent('main', () => App)
  
  // Registra l'app per il web
  if (document.getElementById('root')) {
    AppRegistry.runApplication('main', {
      rootTag: document.getElementById('root')
    })
  }
} else {
  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(App)
}
