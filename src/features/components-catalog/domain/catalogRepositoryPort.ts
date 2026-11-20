import type { ComponentDefinition } from './entities';

export interface CatalogRepository {
  getAllDefinitions(): readonly ComponentDefinition[];
}
