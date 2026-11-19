import type { ComponentDefinition } from './entities';

export interface CatalogRepository {
  getAllDefinitions(): readonly ComponentDefinition[];
  getDefinitionById(definitionId: string): ComponentDefinition | undefined;
}
