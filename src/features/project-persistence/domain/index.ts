export type {
  ProjectMetadata,
  BoardStateSnapshot,
  ProjectDocument,
} from './entities';

export {
  createDefaultProjectMetadata,
  createEmptyProjectDocument,
} from './entities';

export type {
  ProjectStoragePort,
  ProjectFilePort,
} from './ports';

export {
  validateProjectDocument,
  type ProjectValidationResult,
} from './schemaValidator';
