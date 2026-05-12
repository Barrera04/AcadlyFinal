import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import HomeScreen from '../screens/HomeScreen';
import TareasScreen from '../screens/TareasScreen';
import MateriasScreen from '../screens/MateriasScreen';
import HorariosScreen from '../screens/HorariosScreen';
import RecordatoriosScreen from '../screens/RecordatoriosScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
import { Ionicons } from '@expo/vector-icons';
import TabProfileIcon from '../components/TabProfileIcon';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: { height: 70, paddingBottom: 8, backgroundColor: '#fff' },
        tabBarIcon: ({ color }) => {
          if (route.name === 'Perfil') {
            return <TabProfileIcon color={color} size={22} />
          }
          let name: any = 'home-outline'
          if (route.name === 'Inicio') name = 'home-outline'
          if (route.name === 'Tareas') name = 'checkmark-done-outline'
          if (route.name === 'Materias') name = 'book-outline'
          if (route.name === 'Horario') name = 'calendar-outline'
          return <Ionicons name={name} size={22} color={color} />
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9aa4b2',
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Tareas" component={TareasScreen} />
      <Tab.Screen name="Materias" component={MateriasScreen} />
      <Tab.Screen name="Horario" component={HorariosScreen} />
      <Tab.Screen
        name="Perfil"
        component={UsuariosScreen}
        initialParams={{ showOnlyLogged: true }}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user } = useAuth();
  const { loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Recordatorios" component={RecordatoriosScreen} />
            <Stack.Screen name="Usuarios" component={UsuariosScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
