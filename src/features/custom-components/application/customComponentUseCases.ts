import type {
  ComponentDefinition,
  PlacedComponent,
} from '@features/components-catalog/domain';
import type { Wire } from '@features/wiring/domain';
import {
  buildCustomComponentDefinition,
  evaluateDeleteImpact,
  evaluateUpdateImpact,
  validateCustomComponentDraft,
  type BoardDimensionsConfig,
  type CustomComponentDeleteImpact,
  type CustomComponentDraft,
  type CustomComponentUpdateImpact,
  type CustomComponentValidationResult,
  type CustomLibraryFilePort,
} from '../domain';

export interface CustomComponentMutationOutcome {
  readonly ok: boolean;
  readonly validation: CustomComponentValidationResult;
  readonly nextDefinitions: readonly ComponentDefinition[];
  readonly savedDefinition?: ComponentDefinition;
}

export interface UpdateCustomComponentWithImpactOutcome {
  readonly ok: boolean;
  readonly requiresConfirmation: boolean;
  readonly validation: CustomComponentValidationResult;
  readonly impact: CustomComponentUpdateImpact;
  readonly nextDefinitions: readonly ComponentDefinition[];
  readonly savedDefinition?: ComponentDefinition;
}

export interface DeleteCustomComponentWithImpactOutcome {
  readonly ok: boolean;
  readonly requiresConfirmation: boolean;
  readonly impact: CustomComponentDeleteImpact;
  readonly nextDefinitions: readonly ComponentDefinition[];
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
  options?: {
    readonly placedComponents?: readonly PlacedComponent[];
    readonly wires?: readonly Wire[];
    readonly boardConfig?: BoardDimensionsConfig;
    readonly confirmWarnings?: boolean;
  },
): UpdateCustomComponentWithImpactOutcome {
  const validation = validateCustomComponentDraft(draft);
  if (!validation.isValid || !draft.id) {
    return {
      ok: false,
      requiresConfirmation: false,
      validation,
      impact: {
        canSave: false,
        blockingErrors: [],
        warnings: [],
        affectedInstancesCount: 0,
      },
      nextDefinitions: existingDefinitions,
    };
  }

  const updated = buildCustomComponentDefinition(draft);
  const previousDef = existingDefinitions.find(
    (item) => item.id === updated.id,
  );

  const impact: CustomComponentUpdateImpact = previousDef
    ? evaluateUpdateImpact(
        previousDef,
        updated,
        options?.placedComponents ?? [],
        options?.wires ?? [],
        options?.boardConfig,
      )
    : {
        canSave: true,
        blockingErrors: [],
        warnings: [],
        affectedInstancesCount: 0,
      };

  if (!impact.canSave) {
    return {
      ok: false,
      requiresConfirmation: false,
      validation,
      impact,
      nextDefinitions: existingDefinitions,
    };
  }

  if (impact.warnings.length > 0 && !options?.confirmWarnings) {
    return {
      ok: false,
      requiresConfirmation: true,
      validation,
      impact,
      nextDefinitions: existingDefinitions,
    };
  }

  const nextDefinitions = existingDefinitions.map((item) =>
    item.id === updated.id ? updated : item,
  );

  return {
    ok: true,
    requiresConfirmation: false,
    validation,
    impact,
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
  readonly wires?: readonly Wire[];
  readonly forceIfInUse?: boolean;
}): DeleteCustomComponentWithImpactOutcome {
  const targetDefinition = params.existingDefinitions.find(
    (item) => item.id === params.targetId,
  );

  const impact = evaluateDeleteImpact(
    params.targetId,
    params.placedComponents,
    params.wires ?? [],
    targetDefinition,
  );

  if (impact.inUse && !params.forceIfInUse) {
    return {
      ok: false,
      requiresConfirmation: true,
      impact,
      nextDefinitions: params.existingDefinitions,
    };
  }

  return {
    ok: true,
    requiresConfirmation: false,
    impact,
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
