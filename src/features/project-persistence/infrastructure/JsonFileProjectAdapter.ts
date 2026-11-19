import {
  validateProjectDocument,
  type ProjectDocument,
  type ProjectFilePort,
} from '../domain';

function sanitizeFileName(rawName: string): string {
  const cleaned = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || 'projeto-roboboard';
}

export class JsonFileProjectAdapter implements ProjectFilePort {
  public exportToFile(document: ProjectDocument): void {
    const formattedJson = JSON.stringify(document, null, 2);
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);

    const fileSlug = sanitizeFileName(document.metadata.robotName);
    const anchor = window.document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${fileSlug}.roboboard.json`;
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }

  public async importFromFile(file: File): Promise<ProjectDocument> {
    const textContent = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(textContent);
    } catch {
      throw new Error('O arquivo selecionado não contém um JSON válido.');
    }

    const validation = validateProjectDocument(parsed);
    if (!validation.isValid || !validation.document) {
      throw new Error(
        validation.error ?? 'Estrutura de arquivo .roboboard.json inválida.',
      );
    }

    return validation.document;
  }
}

export const jsonFileProjectAdapter = new JsonFileProjectAdapter();
