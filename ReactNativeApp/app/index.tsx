import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import firebaseApp from './firebaseConfig';  // Import the Firebase app

export default function Login() {

  const auth = getAuth(firebaseApp);  // Initialize Firebase Auth
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin1 = () => {
    // Simulate login validation
    if (username === "User" && password === "123") {
      // Navigate to the main page after successful login
      router.push("/MainPage"); // Ensure this matches the path defined in your routing setup
    } else {
      alert("Invalid username or password");
    }
  };

  const handleLogin2 = () => {
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Navigate to the main page after successful login
        console.log("User has loggedIn succesfully");
        alert("You have successfully logged in");

        router.push("/MainPage");
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      });
  };

  const handleForgotPassword = () => {
    if (!username) {
      alert("Please enter your email to reset your password.");
      return;
    }

    sendPasswordResetEmail(auth, username)
      .then(() => {
        alert("Password reset email sent! Check your inbox.");
      })
      .catch((error) => {
        alert("Failed to send reset email: " + error.message);
      });
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title1}>GraphMap</Text>
        <View style={styles.underline} />
        <Image
          source={require('../assets/manlogo1.png')} // Adjust the path as needed
          style={styles.logo}
          resizeMode="contain" // This will ensure the entire image is visible
        />
      </View>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin2}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#2f5a9c",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title1: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",

  },
  underline: {
    width: '60%', // Adjust width to control the length of the line
    height: 4, // Thickness of the line
    backgroundColor: "#000", // Color of the line
    marginTop: 10, // Space between the text and the line
  },
  logo: {
    width: 150, // Adjust width as needed
    height: 150, // Adjust height as needed
    marginVertical: 20, // Space above and below the logo
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 18,
    backgroundColor: "#fff",
  },
  forgotPassword: {
    color: "#fff",
    textAlign: "right",
    marginBottom: 20,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#5b82be", // Background color of the button
    borderRadius: 50, // Rounded corners
    paddingVertical: 15, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    alignItems: "center", // Center text horizontally
    marginTop: 20, // Space above the button
  },
  loginButtonText: {
    color: "#fff", // Text color
    fontSize: 18, // Text size
    fontWeight: "bold", // Text weight
  },
});
