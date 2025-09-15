import { Pool } from "pg";
import { types } from "pg";

// Configuration des parsers de types PostgreSQL pour les dates
types.setTypeParser(1114, (val: string) => new Date(val));
types.setTypeParser(1184, (val: string) => new Date(val));

/**
 * Vérifie si l'URL de la base de données est valide
 */
const validateDatabaseUrl = (url: string): boolean => {
  return Boolean(url && url.startsWith("postgresql://") && url.length > 20);
};

// Pool de connexion dynamique basé sur l'environnement
let pool: Pool | undefined;

export function getPool(): Pool | null {
  if (!pool) {
    let connectionString: string;

    // ✅ Mode démo - Base de données simulée
    if (process.env.NODE_ENV === "development" || !process.env.DATABASE_URL) {
      // En mode démo, on utilise une base de données locale ou simulée
      connectionString =
        process.env.DATABASE_URL ||
        "postgresql://demo:demo@localhost:5432/demo_db";
      console.log(
        "🔧 [DEMO] Utilisation de la base de données de démonstration"
      );
    } else {
      connectionString = process.env.DATABASE_URL;
    }

    if (!validateDatabaseUrl(connectionString)) {
      console.warn(
        "⚠️ [DEMO] URL de base de données invalide, utilisation du mode simulation"
      );
      return null; // Retourner null en mode simulation
    }

    try {
      pool = new Pool({
        connectionString,
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                rejectUnauthorized: false,
              }
            : false,
        // Configuration optimisée pour Firebase Functions
        max: 5, // Plus de connexions disponibles
        min: 1, // Garde toujours 1 connexion ouverte

        // Timeouts adaptés pour Firebase Functions
        // ✅ Configuration équilibrée :
        // - Assez long pour opérations complexes (IA, uploads)
        // - Assez court pour détecter les problèmes rapidement
        idleTimeoutMillis: 120000, // 2min permet opérations IA
        connectionTimeoutMillis: 15000, // 15 secondes - détection rapide des problèmes réseau

        // Keepalive optimisé
        keepAlive: true,
        keepAliveInitialDelayMillis: 2000, // 2 secondes

        // Permet la sortie propre
        allowExitOnIdle: false, // Ne ferme pas automatiquement en production
      });

      // Gestion des erreurs avec recréation automatique du pool
      pool.on("error", (err, client) => {
        console.error("🔴 Erreur PostgreSQL Pool:", err.message);
        console.error("🔄 Pool sera recréé au prochain appel");
        pool = undefined; // Force recréation au prochain appel
      });

      // Configuration du search_path pour chaque nouvelle connexion
      // Cela permet d'accéder aux tables du schéma 'vertex' sans préfixe
      // Impact sur la latence : ~1-5ms par nouvelle connexion (négligeable avec un pool)
      pool.on("connect", (client) => {
        client.query("SET search_path TO public, vertex;");
      });

      pool.on("release", (err, client) => {
        if (err) {
          console.error(
            "⚠️ Erreur lors de la libération de connexion:",
            err.message
          );
        }
      });

      // Gestion propre de la fermeture du pool
      process.on("SIGTERM", () => {
        if (pool) {
          pool.end();
          pool = undefined;
        }
      });
    } catch (error) {
      console.warn(
        "⚠️ [DEMO] Impossible de se connecter à PostgreSQL, mode simulation activé"
      );
      return null; // Retourner null en cas d'erreur
    }
  }

  return pool;
}

// Export par défaut pour la compatibilité
export default {
  getPool,
};
