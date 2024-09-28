import { Stack } from "expo-router";
import { useEffect } from "react";
import firebaseApp from "./firebaseConfig";  // Import your Firebase app

export default function RootLayout() {
  useEffect(() => {
    // Firebase app has already been initialized in firebaseConfig.ts
  }, []);

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} // Hide the header for the Login screen
      />
      <Stack.Screen 
        name="MainPage"
        options={{ headerShown: false }} // Hide the header for the MainPage screen
      />
    </Stack>
  );
}
