import {
  validateProjectDocument,
  type ProjectDocument,
  type ProjectStoragePort,
} from '../domain';

const STORAGE_KEY = 'roboboard_docs_active_project_v1';

export class LocalStorageProjectRepository implements ProjectStoragePort {
  public save(document: ProjectDocument): void {
    try {
      const serialized = JSON.stringify(document);
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Silencia falha de quota de armazenamento local
    }
  }

  public load(): ProjectDocument | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);
      const validation = validateProjectDocument(parsed);
      return validation.isValid && validation.document
        ? validation.document
        : null;
    } catch {
      return null;
    }
  }

  public clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silencia erro de acesso ao storage
    }
  }
}

export const localStorageProjectRepository =
  new LocalStorageProjectRepository();
