// Import required Firebase modules
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } = require('firebase/auth');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT30olKsQF3rGq3WMSnZUnJNe4ZAwGPg4",
  authDomain: "graphmap-dde05.firebaseapp.com",
  databaseURL: "https://graphmap-dde05-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "graphmap-dde05",
  storageBucket: "graphmap-dde05.appspot.com",
  messagingSenderId: "836254374850",
  appId: "1:836254374850:web:0be1be29df81fc3c60d45b",
  measurementId: "G-SLFBRW13TM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Replace with your test user's email and password
const email = "yassen@gmail.com";
const password = "123123123";

// Set persistence to browser local storage
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to browser local storage.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Sign in the user
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("User signed in:", userCredential.user.uid);

    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user.uid);
        
        // Call the function to handle file upload
        // Example: Replace 'someOrderId' with the actual order ID and simulate a file input event
        const simulatedEvent = {
          target: {
            files: [new File(["dummy content"], "testfile.txt")]
          }
        };
        handleFileUpload('someOrderId', simulatedEvent);
      } else {
        console.log("No user is authenticated.");
      }
    });

  })
  .catch((error) => {
    console.error("Error signing in:", error.message);
  });

// Function to handle file upload
const handleFileUpload = async (orderId, event) => {
  const user = auth.currentUser;
  console.log("Checking user authentication:", user);

  if (!user) {
    console.error("User is not authenticated.");
    return;
  }

  const file = event.target.files[0];
  if (file) {
    const fileStorageRef = ref(storage, `orders/${orderId}/${file.name}`);
    try {
      await uploadBytes(fileStorageRef, file);
      console.log("File uploaded successfully.");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }
};