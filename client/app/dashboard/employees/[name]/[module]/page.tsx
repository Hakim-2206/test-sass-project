"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AI_EMPLOYEES, ModuleId } from "../../../../../data/ai-employees";
import { getModule } from "../../../../../modules/core/ModuleRegistry";

interface ModulePageProps {
  params: {
    name: string;
    module: string;
  };
}

export default function ModulePage({ params }: ModulePageProps) {
  const router = useRouter();
  const employee = AI_EMPLOYEES.find((emp) => emp.id === params.name);

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Employé non trouvé
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  // Récupérer le module correspondant
  const moduleComponent = getModule(params.module);

  if (!moduleComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Module non trouvé
          </h1>
          <p className="text-gray-600 mb-4">
            Le module "{params.module}" n'existe pas.
          </p>
          <button
            onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux applications
          </button>
        </div>
      </div>
    );
  }

  // Props pour le module
  const moduleProps = {
    employee: {
      id: employee.id,
      name: employee.name,
      hexColor: employee.hexColor,
      description: employee.role,
    },
    onModuleChange: (moduleId: string) => {
      router.push(`/dashboard/employees/${employee.id}/${moduleId}`);
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Dashboard
            </button>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              {employee.name}
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {params.module === ModuleId.CHAT && "Chat IA"}
              {params.module === ModuleId.TEXTS && "Gestion des Textes"}
              {params.module === ModuleId.COMMENTS &&
                "Gestion des Commentaires"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: employee.hexColor }}
            >
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{employee.name}</span>
          </div>
        </div>
      </div>

      {/* Contenu du module */}
      <div className="h-[calc(100vh-73px)]">
        <moduleComponent.component {...moduleProps} />
      </div>
    </div>
  );
}
