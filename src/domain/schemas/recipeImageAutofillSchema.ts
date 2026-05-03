import { z } from 'zod';
import type { IngredientUnit } from '@domain/entities/Recipe';
import type { RecipeFormValues } from '@domain/schemas/recipeSchema';

const extractedIngredientSchema = z.object({
  name: z.string().trim().min(1).max(80),
  amount: z.number().positive().finite().nullable().optional(),
  unit: z.string().trim().min(1).max(32).nullable().optional(),
});

const extractedRecipeSchema = z.object({
  title: z.string().trim().min(1).max(120).nullable().optional(),
  prepTimeMinutes: z.number().int().nonnegative().max(1_440).nullable().optional(),
  cookTimeMinutes: z.number().int().nonnegative().max(1_440).nullable().optional(),
  servings: z.number().int().positive().max(1_000).nullable().optional(),
  ingredients: z.array(extractedIngredientSchema).max(80).optional(),
  instructions: z.array(z.string().trim().min(1).max(2_000)).max(200).optional(),
  warnings: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
});

export const recipeImageAutofillResponseSchema = z.object({
  recipe: extractedRecipeSchema,
});

export const recipeImageOcrResponseSchema = z.object({
  texts: z.array(z.string().trim().min(1).max(8_000)).max(8),
  warnings: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
});

export type RecipeImageAutofillResponse = z.infer<typeof recipeImageAutofillResponseSchema>;
export type RecipeImageOcrResponse = z.infer<typeof recipeImageOcrResponseSchema>;

export interface RecipeAutofillPatch {
  readonly values: Partial<RecipeFormValues>;
  readonly warnings: ReadonlyArray<string>;
}

const hebrewUnitMap = new Map<string, IngredientUnit>([
  ['גרם', 'grams'],
  ['גרמים', 'grams'],
  ['ג', 'grams'],
  ['מל', 'ml'],
  ['מ"ל', 'ml'],
  ['מיליליטר', 'ml'],
  ['מיליליטרים', 'ml'],
  ['כוס', 'cups'],
  ['כוסות', 'cups'],
  ['כף', 'spoons'],
  ['כפות', 'spoons'],
  ['כפית', 'teaspoons'],
  ['כפיות', 'teaspoons'],
  ['יחידה', 'units'],
  ['יחידות', 'units'],
]);

const latinUnitMap = new Map<string, IngredientUnit>([
  ['g', 'grams'],
  ['gram', 'grams'],
  ['grams', 'grams'],
  ['gr', 'grams'],
  ['kg', 'grams'],
  ['ml', 'ml'],
  ['milliliter', 'ml'],
  ['milliliters', 'ml'],
  ['cup', 'cups'],
  ['cups', 'cups'],
  ['tbsp', 'spoons'],
  ['tablespoon', 'spoons'],
  ['tablespoons', 'spoons'],
  ['tsp', 'teaspoons'],
  ['teaspoon', 'teaspoons'],
  ['teaspoons', 'teaspoons'],
  ['unit', 'units'],
  ['units', 'units'],
  ['piece', 'units'],
  ['pieces', 'units'],
]);

function normalizeUnit(input: string | null | undefined): IngredientUnit {
  if (!input) return 'units';
  const normalized = input.trim().toLowerCase();
  return hebrewUnitMap.get(normalized) ?? latinUnitMap.get(normalized) ?? 'units';
}

export function mapAutofillResponseToFormPatch(input: unknown): RecipeAutofillPatch {
  const parsed = recipeImageAutofillResponseSchema.parse(input);
  const patch: Partial<RecipeFormValues> = {};
  const recipe = parsed.recipe;

  if (recipe.title) patch.title = recipe.title;

  if ('prepTimeMinutes' in recipe) patch.prepTimeMinutes = recipe.prepTimeMinutes ?? NaN;
  if ('cookTimeMinutes' in recipe) patch.cookTimeMinutes = recipe.cookTimeMinutes ?? NaN;
  if ('servings' in recipe) patch.servings = recipe.servings ?? NaN;

  const normalizedIngredients = (recipe.ingredients ?? [])
    .map((item) => {
      const amount = item.amount ?? NaN;
      return {
        name: item.name.trim(),
        amount,
        unit: normalizeUnit(item.unit),
      };
    })
    .filter((item) => item.name.length > 0);
  if (normalizedIngredients.length > 0) {
    patch.ingredients = normalizedIngredients;
  }

  const normalizedInstructions = (recipe.instructions ?? [])
    .map((text) => ({ text: text.trim() }))
    .filter((item) => item.text.length > 0);
  if (normalizedInstructions.length > 0) {
    patch.instructions = normalizedInstructions;
  }

  return {
    values: patch,
    warnings: recipe.warnings ?? [],
  };
}
