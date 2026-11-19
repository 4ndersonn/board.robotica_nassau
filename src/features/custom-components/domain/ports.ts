import type { ComponentDefinition } from '@features/components-catalog/domain';

export interface CustomCatalogStoragePort {
  loadCustomDefinitions(): readonly ComponentDefinition[];
  saveCustomDefinitions(definitions: readonly ComponentDefinition[]): void;
}

export interface CustomLibraryFilePort {
  exportLibraryToFile(definitions: readonly ComponentDefinition[]): void;
  importLibraryFromFile(file: File): Promise<readonly ComponentDefinition[]>;
}
