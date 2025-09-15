import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

/**
 * Configuration Firebase pour le test technique
 * 🔧 VERSION DEMO - Uniquement mode développement local
 */
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// ✅ Configuration selon l'environnement
const functions = getFunctions(app, "us-central1");

// ✅ Connexion aux émulateurs uniquement en développement
if (process.env.NODE_ENV === "development") {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  } catch (error) {
    // Émulateurs déjà connectés
    console.log("Émulateurs Firebase déjà connectés");
  }
}

export { app, auth, functions };
