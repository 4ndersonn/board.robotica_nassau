import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import {
  buildCustomComponentDefinition,
  validateCustomComponentDraft,
  type CustomComponentDraft,
  type CustomComponentValidationResult,
  type CustomLibraryFilePort,
} from '../domain';

export interface CustomComponentMutationOutcome {
  readonly ok: boolean;
  readonly validation: CustomComponentValidationResult;
  readonly nextDefinitions: readonly ComponentDefinition[];
  readonly savedDefinition?: ComponentDefinition;
}

export function createCustomComponent(
  draft: CustomComponentDraft,
  existingDefinitions: readonly ComponentDefinition[],
): CustomComponentMutationOutcome {
  const validation = validateCustomComponentDraft(draft);
  if (!validation.isValid) {
    return {
      ok: false,
      validation,
      nextDefinitions: existingDefinitions,
    };
  }

  const created = buildCustomComponentDefinition({
    ...draft,
    id: undefined,
  });

  return {
    ok: true,
    validation,
    nextDefinitions: [...existingDefinitions, created],
    savedDefinition: created,
  };
}

export function updateCustomComponent(
  draft: CustomComponentDraft,
  existingDefinitions: readonly ComponentDefinition[],
): CustomComponentMutationOutcome {
  const validation = validateCustomComponentDraft(draft);
  if (!validation.isValid || !draft.id) {
    return {
      ok: false,
      validation,
      nextDefinitions: existingDefinitions,
    };
  }

  const updated = buildCustomComponentDefinition(draft);
  const nextDefinitions = existingDefinitions.map((item) =>
    item.id === updated.id ? updated : item,
  );

  return {
    ok: true,
    validation,
    nextDefinitions,
    savedDefinition: updated,
  };
}

export function duplicateCustomComponent(
  targetId: string,
  existingDefinitions: readonly ComponentDefinition[],
): readonly ComponentDefinition[] {
  const target = existingDefinitions.find((item) => item.id === targetId);
  if (!target) {
    return existingDefinitions;
  }

  const copy: ComponentDefinition = {
    ...target,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${target.name} (Cópia)`,
    isCustom: true,
  };

  return [...existingDefinitions, copy];
}

export function deleteCustomComponent(params: {
  readonly targetId: string;
  readonly existingDefinitions: readonly ComponentDefinition[];
  readonly placedComponents: readonly PlacedComponent[];
  readonly forceIfInUse?: boolean;
}): {
  readonly ok: boolean;
  readonly isInUseCount: number;
  readonly nextDefinitions: readonly ComponentDefinition[];
} {
  const inUseCount = params.placedComponents.filter(
    (item) => item.definitionId === params.targetId,
  ).length;

  if (inUseCount > 0 && !params.forceIfInUse) {
    return {
      ok: false,
      isInUseCount: inUseCount,
      nextDefinitions: params.existingDefinitions,
    };
  }

  return {
    ok: true,
    isInUseCount: inUseCount,
    nextDefinitions: params.existingDefinitions.filter(
      (item) => item.id !== params.targetId,
    ),
  };
}

export function exportLibrary(
  filePort: CustomLibraryFilePort,
  definitions: readonly ComponentDefinition[],
): void {
  filePort.exportLibraryToFile(definitions);
}

export async function importLibrary(
  filePort: CustomLibraryFilePort,
  file: File,
  existingDefinitions: readonly ComponentDefinition[],
): Promise<readonly ComponentDefinition[]> {
  const imported = await filePort.importLibraryFromFile(file);
  return mergeCustomDefinitions(existingDefinitions, imported);
}

export function mergeCustomDefinitions(
  existingDefinitions: readonly ComponentDefinition[],
  incomingDefinitions: readonly ComponentDefinition[],
): readonly ComponentDefinition[] {
  const byId = new Map<string, ComponentDefinition>(
    existingDefinitions.map((item) => [item.id, item]),
  );

  for (const incoming of incomingDefinitions) {
    byId.set(incoming.id, { ...incoming, isCustom: true });
  }

  return Array.from(byId.values());
}
