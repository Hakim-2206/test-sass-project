// ✅ Import des repositories
import { TextRepository } from "./textRepository.js";
import { CommentRepository } from "./commentRepository.js";

// ✅ Singleton instances
let textRepo: TextRepository | undefined;
let commentRepo: CommentRepository | undefined;

// ✅ Getter avec lazy initialization pour TextRepository
export function getTextRepository(): TextRepository {
  if (!textRepo) {
    textRepo = new TextRepository();
  }
  return textRepo;
}

// ✅ Getter avec lazy initialization pour CommentRepository
export function getCommentRepository(): CommentRepository {
  if (!commentRepo) {
    commentRepo = new CommentRepository();
  }
  return commentRepo;
}

// ✅ Cleanup function pour les tests
export function clearRepositories(): void {
  textRepo = undefined;
  commentRepo = undefined;
}
