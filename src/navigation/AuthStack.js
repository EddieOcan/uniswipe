import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/auth/LoginScreen"
import SignupScreen from "../screens/auth/SignupScreen"
import WelcomeScreen from "../screens/auth/WelcomeScreen"
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen"

const Stack = createNativeStackNavigator()

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

export default AuthStack
