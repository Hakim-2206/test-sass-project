// ✅ Configuration des variables d'environnement pour le mode démo
if (process.env.NODE_ENV === "development") {
  // Définir les variables d'environnement pour le mode démo
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || "postgresql://demo:demo@localhost:5432/demo_db";
  process.env.SERVER_API_AGENT_TOKEN =
    process.env.SERVER_API_AGENT_TOKEN || "demo-server-token-123";
  process.env.JWT_WORKSPACE_SECRET =
    process.env.JWT_WORKSPACE_SECRET || "demo-jwt-secret-456";
  process.env.DATABASE_URL_PROD =
    process.env.DATABASE_URL_PROD ||
    "postgresql://demo:demo@localhost:5432/demo_db";

  console.log(
    "🔧 [DEMO] Variables d'environnement configurées pour le mode démo"
  );
}

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2";
const app = initializeApp();
export const dbFirestore = getFirestore(app);
export const auth = getAuth(app);

// ✅ Configuration Firebase selon les règles Agentova
if (process.env.NODE_ENV === "development") {
  // Émulateurs Firebase (us-central1 obligatoire)
  setGlobalOptions({
    region: "us-central1", // ✅ Correction: us-central1 (pas us-central)
    concurrency: 15,
  });
} else {
  // Production optimisée EU
  setGlobalOptions({
    region: "europe-west1",
    concurrency: 10,
    memory: "512MiB",
  });
}

export const serverToken = defineSecret("SERVER_API_AGENT_TOKEN");
export const jwtWorkspaceSecret = defineSecret("JWT_WORKSPACE_SECRET");
export const databaseUrlProd = defineSecret("DATABASE_URL_PROD");

export const SERVICE_URL = {
  FIREBASE: "http://localhost:5001/demo-project/us-central1",
  FASTAPI: "http://127.0.0.1:8080",
  APP: "http://localhost:3000",
};
