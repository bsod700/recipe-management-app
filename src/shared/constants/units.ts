import type { IngredientUnit } from '@domain/entities/Recipe';
import { strings } from '@shared/i18n/he';

export interface UnitOption {
  readonly value: IngredientUnit;
  readonly label: string;
}

export const UNIT_OPTIONS: ReadonlyArray<UnitOption> = [
  { value: 'grams', label: strings.units.grams },
  { value: 'ml', label: strings.units.ml },
  { value: 'cups', label: strings.units.cups },
  { value: 'spoons', label: strings.units.spoons },
  { value: 'teaspoons', label: strings.units.teaspoons },
  { value: 'units', label: strings.units.units },
];

export const DEFAULT_UNIT: IngredientUnit = 'grams';
