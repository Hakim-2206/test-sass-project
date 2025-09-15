import React from "react";
import { createModule, ModuleProps } from "./core/BaseModule";

// ========================== INTERFACES ==========================

interface ChatModuleProps extends ModuleProps {
  // Props spécifiques au chat si nécessaire
}

// ========================== COMPOSANT MODULE ==========================

const ChatModuleComponent: React.FC<ChatModuleProps> = ({
  employee,
  onModuleChange,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header du module */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: employee.hexColor + "20" }}
      >
        <h2 className="text-xl font-semibold text-gray-800">
          Chat avec {employee.name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">{employee.description}</p>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 p-4">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: employee.hexColor }}
          >
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Chat avec {employee.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Module de chat en cours de développement
          </p>
          <div className="text-sm text-gray-500">
            Couleur: {employee.hexColor}
          </div>
        </div>
      </div>

      {/* Footer du module */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Module Chat - Version Demo
        </div>
      </div>
    </div>
  );
};

// ========================== EXPORT MODULE ==========================

export default createModule(ChatModuleComponent, "chat");
