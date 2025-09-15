import dotenv from "dotenv";

// Charger .env.local uniquement en développement
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.local" });
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
