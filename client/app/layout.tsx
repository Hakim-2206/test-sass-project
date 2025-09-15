"use client";

import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
// ✅ Initialiser Firebase
import "../services/api/firebase/config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Configuration React Query selon les règles Agentova
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Toujours refetch
            refetchOnMount: true, // Refetch au montage
            placeholderData: (prev) => prev, // Garde données pendant refetch
          },
        },
      })
  );

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0349C5" />
      </head>
      <body className="antialiased bg-gray-100">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
          {/* ✅ DevTools en développement uniquement */}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
