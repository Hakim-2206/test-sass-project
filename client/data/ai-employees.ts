export enum EmployeeName {
  ELISA = "elisa",
  BENOIT = "benoit",
  MARGOT = "margot",
  ETHAN = "ethan",
  ARTHUR = "arthur",
  CHARLOTTE = "charlotte",
  SAMY = "samy",
  AMANDINE = "amandine",
}

export enum ModuleId {
  CHAT = "chat",
  TEXTS = "texts",
}

export interface App {
  moduleId: ModuleId;
  title: string;
  subtitle: string;
  description: string;
  icons: Array<string>;
  actionIcon?: any;
}

export interface AIEmployee {
  id: EmployeeName;
  name: string;
  role: string;
  hexColor: string; // Couleur hex pour le chat (format #hex)
  imageSrc: string;
  appName: string; // ID unique pour identifier l'agent dans les conversations
}

export const getEmployeeInfo = (appName: string) => {
  const employee = AI_EMPLOYEES.find((emp) => emp.appName === appName);
  return {
    name: employee?.name || AI_EMPLOYEES[0].name,
    imageSrc: employee?.imageSrc || AI_EMPLOYEES[0].imageSrc,
  };
};

// Source unique de vérité pour les données des employés AI
export const AI_EMPLOYEES: AIEmployee[] = [
  //Il faut laisser Elisa en premier comme il y a une référence à elle
  {
    id: EmployeeName.ELISA,
    name: "Élisa",
    role: "Directrice OP",
    hexColor: "#F63B47",
    imageSrc: "/images/agent/elisa-square.png",
    appName: "elisa_agent",
  },
];

// Apps de démonstration pour les employés
export const employeeApps: Partial<Record<EmployeeName, App[]>> = {
  [EmployeeName.ELISA]: [
    {
      moduleId: ModuleId.CHAT,
      title: "Chat IA",
      subtitle: "Conversation avec Élisa",
      description: "Discutez avec Élisa, votre assistante IA",
      icons: ["RiChat3Line"],
    },
    {
      moduleId: ModuleId.TEXTS,
      title: "Gestion des Textes",
      subtitle: "Créer et gérer des textes",
      description: "Créez, modifiez et organisez vos textes",
      icons: ["RiFileTextLine"],
    },
  ],
};

export const getAppsByEmployee = (employeeId: EmployeeName): App[] => {
  const specificApps = employeeApps[employeeId];
  return specificApps ? [...specificApps] : [];
};
