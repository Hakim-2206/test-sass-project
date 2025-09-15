import { ModuleComponent } from "./BaseModule";
import { ModuleId } from "../../data/ai-employees";
import ChatModule from "../ChatModule";
import TextModule from "../TextModule";
import CommentModule from "../CommentModule";

const modulesComponents: Record<ModuleId, ModuleComponent> = {
  [ModuleId.CHAT]: ChatModule,
  [ModuleId.TEXTS]: TextModule,
  [ModuleId.COMMENTS]: CommentModule,
};

export const getModule = (moduleId: string): ModuleComponent | undefined => {
  return modulesComponents[moduleId as ModuleId];
};

export const registerModule = (moduleComponent: ModuleComponent) => {
  modulesComponents[moduleComponent.moduleId as ModuleId] = moduleComponent;
};
