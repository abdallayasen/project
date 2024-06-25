// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); // For Firebase Realtime Database
