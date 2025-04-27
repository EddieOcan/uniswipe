import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"

import HomeScreen from "../screens/main/HomeScreen"
import HelpRequestsScreen from "../screens/main/HelpRequestsScreen"
import TutorsScreen from "../screens/main/TutorsScreen"
import MessagesScreen from "../screens/main/MessagesScreen"
import ProfileScreen from "../screens/main/ProfileScreen"
import CreateHelpRequestScreen from "../screens/main/CreateHelpRequestScreen"
import HelpRequestDetailScreen from "../screens/main/HelpRequestDetailScreen"
import TutorDetailScreen from "../screens/main/TutorDetailScreen"
import ChatScreen from "../screens/main/ChatScreen"
import EditProfileScreen from "../screens/main/EditProfileScreen"
import BecomeTutorScreen from "../screens/main/BecomeTutorScreen"

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="HelpRequestDetail"
        component={HelpRequestDetailScreen}
        options={{ title: "Dettaglio Richiesta" }}
      />
      <Stack.Screen name="TutorDetail" component={TutorDetailScreen} options={{ title: "Dettaglio Tutor" }} />
    </Stack.Navigator>
  )
}

const HelpRequestsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HelpRequestsScreen" component={HelpRequestsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateHelpRequest"
        component={CreateHelpRequestScreen}
        options={{ title: "Nuova Richiesta" }}
      />
      <Stack.Screen
        name="HelpRequestDetail"
        component={HelpRequestDetailScreen}
        options={{ title: "Dettaglio Richiesta" }}
      />
    </Stack.Navigator>
  )
}

const TutorsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TutorsScreen" component={TutorsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TutorDetail" component={TutorDetailScreen} options={{ title: "Dettaglio Tutor" }} />
    </Stack.Navigator>
  )
}

const MessagesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.name })} />
    </Stack.Navigator>
  )
}

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Modifica Profilo" }} />
      <Stack.Screen name="BecomeTutor" component={BecomeTutorScreen} options={{ title: "Diventa Tutor" }} />
    </Stack.Navigator>
  )
}

const MainStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "HelpRequests") {
            iconName = focused ? "help-circle" : "help-circle-outline"
          } else if (route.name === "Tutors") {
            iconName = focused ? "school" : "school-outline"
          } else if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#3498db",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: "Home" }} />
      <Tab.Screen name="HelpRequests" component={HelpRequestsStack} options={{ title: "Richieste" }} />
      <Tab.Screen name="Tutors" component={TutorsStack} options={{ title: "Tutor" }} />
      <Tab.Screen name="Messages" component={MessagesStack} options={{ title: "Messaggi" }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Profilo" }} />
    </Tab.Navigator>
  )
}

export default MainStack
