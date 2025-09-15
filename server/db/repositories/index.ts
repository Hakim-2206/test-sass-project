// ✅ Import uniquement du TextRepository pour le test
import { TextRepository } from './textRepository.js';

// ✅ Singleton instance uniquement pour TextRepository
let textRepo: TextRepository | undefined;

// ✅ Getter avec lazy initialization uniquement pour TextRepository
export function getTextRepository(): TextRepository {
  if (!textRepo) {
    textRepo = new TextRepository();
  }
  return textRepo;
}

// ✅ Cleanup function pour les tests
export function clearRepositories(): void {
  textRepo = undefined;
} 



