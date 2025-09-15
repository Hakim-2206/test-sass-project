// ✅ Export des fonctions Firebase pour le test
export { createText, getTexts, deleteText } from "./services/textService";
export {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./services/commentService";
export * from "./utils/authWorkspace";
