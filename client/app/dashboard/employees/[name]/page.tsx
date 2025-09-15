"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AI_EMPLOYEES,
  getAppsByEmployee,
  EmployeeName,
} from "../../../../data/ai-employees";
import { RiChat3Line, RiFileTextLine, RiChat1Line } from "react-icons/ri";

interface EmployeePageProps {
  params: {
    name: string;
  };
}

export default function EmployeePage({ params }: EmployeePageProps) {
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

  const apps = getAppsByEmployee(employee.id as EmployeeName);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Retour au dashboard
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: employee.hexColor }}
            >
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.name}
              </h1>
              <p className="text-gray-600">{employee.role}</p>
            </div>
          </div>
        </div>

        {/* Applications disponibles */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Applications disponibles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => {
              const IconComponent =
                app.icons[0] === "RiChat3Line"
                  ? RiChat3Line
                  : app.icons[0] === "RiFileTextLine"
                  ? RiFileTextLine
                  : app.icons[0] === "RiChat1Line"
                  ? RiChat1Line
                  : RiChat3Line;

              return (
                <div
                  key={app.moduleId}
                  className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:shadow-md bg-gray-50 hover:bg-white"
                  onClick={() =>
                    router.push(
                      `/dashboard/employees/${employee.id}/${app.moduleId}`
                    )
                  }
                >
                  <div className="flex items-center gap-4 mb-3">
                    <IconComponent className="w-8 h-8 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{app.subtitle}</p>
                  <p className="text-xs text-gray-500">{app.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
