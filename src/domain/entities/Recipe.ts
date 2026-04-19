/**
 * Core domain entities — framework-agnostic.
 * No React Native, no SQLite, no form libs here.
 */

export type IngredientUnit =
  | 'grams'
  | 'ml'
  | 'cups'
  | 'spoons'
  | 'teaspoons'
  | 'units';

export interface Ingredient {
  readonly name: string;
  readonly amount: number;
  readonly unit: IngredientUnit;
}

export interface Recipe {
  readonly id: string;
  readonly title: string;
  readonly prepTimeMinutes: number;
  readonly cookTimeMinutes: number;
  readonly servings: number;
  readonly ingredients: ReadonlyArray<Ingredient>;
  readonly instructions: string;
  readonly imageUri?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
