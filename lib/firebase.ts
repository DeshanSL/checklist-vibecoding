import { initializeApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  projectId: 'checklist-558d9', // Your project ID
  // Add other config properties if needed
  apiKey: "your-api-key", // You'll need to add this from Firebase console
  authDomain: "checklist-558d9.firebaseapp.com",
  appId: "your-app-id" // You'll need to add this from Firebase console
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Get a reference to the Firestore service
export const db: Firestore = getFirestore(app)
export default app
