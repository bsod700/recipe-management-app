import { z } from 'zod';
import { strings } from '@shared/i18n/he';

export const ingredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, strings.errors.ingredientNameRequired)
    .max(80, strings.errors.tooLong),
  amount: z
    .number({ invalid_type_error: strings.errors.amountInvalid })
    .positive(strings.errors.amountInvalid)
    .finite(strings.errors.amountInvalid),
  unit: z.enum(['grams', 'ml', 'cups', 'spoons', 'teaspoons', 'units'], {
    errorMap: () => ({ message: strings.errors.unitRequired }),
  }),
});

export const instructionStepSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, strings.errors.instructionsRequired)
    .max(2_000, strings.errors.tooLong),
});

export const recipeFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, strings.errors.titleRequired)
      .max(120, strings.errors.tooLong),
    prepTimeMinutes: z
      .number({ invalid_type_error: strings.errors.timeInvalid })
      .int(strings.errors.timeInvalid)
      .nonnegative(strings.errors.timeInvalid)
      .max(1_440, strings.errors.timeInvalid),
    cookTimeMinutes: z
      .number({ invalid_type_error: strings.errors.timeInvalid })
      .int(strings.errors.timeInvalid)
      .nonnegative(strings.errors.timeInvalid)
      .max(1_440, strings.errors.timeInvalid),
    servings: z
      .number({ invalid_type_error: strings.errors.servingsInvalid })
      .int(strings.errors.servingsInvalid)
      .positive(strings.errors.servingsInvalid)
      .max(1_000, strings.errors.servingsInvalid),
    ingredients: z
      .array(ingredientSchema)
      .min(1, strings.errors.atLeastOneIngredient),
    instructions: z
      .array(instructionStepSchema)
      .min(1, strings.errors.instructionsRequired),
    imageUri: z.string().optional(),
  })
  .refine(
    (value) => value.prepTimeMinutes + value.cookTimeMinutes > 0,
    {
      message: strings.errors.timeInvalid,
      path: ['prepTimeMinutes'],
    }
  );

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
export type IngredientFormValues = z.infer<typeof ingredientSchema>;
