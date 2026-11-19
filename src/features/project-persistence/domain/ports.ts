import type { ProjectDocument } from './entities';

export interface ProjectStoragePort {
  save(document: ProjectDocument): void;
  load(): ProjectDocument | null;
  clear(): void;
}

export interface ProjectFilePort {
  exportToFile(document: ProjectDocument): void;
  importFromFile(file: File): Promise<ProjectDocument>;
}
