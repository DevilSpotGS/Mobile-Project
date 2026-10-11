import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AcademicProvider } from "./src/context/AcademicContext";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

import Dashboard from "./src/screens/Dashboard";
import Timetable from "./src/screens/Timetable";
import Planner from "./src/screens/Planner";
import Profile from "./src/screens/Profile";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainAppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#006664",
      tabBarStyle: { height: 80, paddingBottom: 15, paddingTop: 10 },
      tabBarIcon: ({ color, focused }) => {
        let name =
          route.name === "หน้าหลัก"
            ? "home"
            : route.name === "ตารางเรียน"
              ? "calendar"
              : route.name === "กิจกรรม"
                ? "list"
                : "person";
        return (
          <Ionicons
            name={focused ? name : `${name}-outline`}
            size={24}
            color={color}
          />
        );
      },
    })}
  >
    <Tab.Screen name="หน้าหลัก" component={Dashboard} />
    <Tab.Screen name="ตารางเรียน" component={Timetable} />
    <Tab.Screen name="กิจกรรม" component={Planner} />
    <Tab.Screen name="โปรไฟล์" component={Profile} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {user ? (
        <MainAppTabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AcademicProvider>
      <RootNavigator />
    </AcademicProvider>
  );
}
