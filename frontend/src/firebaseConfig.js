// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBwf4J2n4GB--ODIMOr2lQz4K_ILW2W6E",
  authDomain: "campus-events-web-app.firebaseapp.com",
  projectId: "campus-events-web-app",
  storageBucket: "campus-events-web-app.appspot.com", 
  messagingSenderId: "489138736003",
  appId: "1:489138736003:web:a181f3ff38985d5b5f44b6",
  measurementId: "G-MJFE8JP1TB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage properly
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
