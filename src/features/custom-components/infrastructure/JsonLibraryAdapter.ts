import type { ComponentDefinition } from '@features/components-catalog/domain';
import type { CustomLibraryFilePort } from '../domain';
import { parseCustomComponentDefinition } from './LocalStorageCustomCatalogRepository';

export class JsonLibraryAdapter implements CustomLibraryFilePort {
  public exportLibraryToFile(
    definitions: readonly ComponentDefinition[],
  ): void {
    const payload = {
      schemaVersion: 1,
      libraryName: 'Biblioteca Customizada RoboBoard Docs',
      exportedAt: new Date().toISOString(),
      components: definitions,
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);

    const anchor = window.document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'biblioteca-equipe.json';
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }

  public async importLibraryFromFile(
    file: File,
  ): Promise<readonly ComponentDefinition[]> {
    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('O arquivo selecionado não é um JSON válido.');
    }

    const rawList: unknown[] = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' &&
          parsed !== null &&
          Array.isArray((parsed as { components?: unknown }).components)
        ? ((parsed as { components: unknown[] }).components)
        : [];

    if (rawList.length === 0) {
      throw new Error(
        'Nenhum componente customizado válido encontrado em biblioteca-equipe.json.',
      );
    }

    const imported: ComponentDefinition[] = [];
    for (const item of rawList) {
      const valid = parseCustomComponentDefinition(item);
      if (!valid) {
        throw new Error(
          'Um ou mais componentes da biblioteca possuem formato ou pinagem inválida.',
        );
      }
      imported.push(valid);
    }

    return imported;
  }
}

export const jsonLibraryAdapter = new JsonLibraryAdapter();
