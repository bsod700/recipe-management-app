import type { Ingredient, Recipe, RecipeDraft } from '@domain/entities/Recipe';
import { getDb } from '@data/db/database';
import { newId } from '@shared/utils/uuid';
import { deleteImage } from '@shared/utils/images';

interface RecipeRow {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  image_uri: string | null;
  created_at: number;
  updated_at: number;
}

function rowToRecipe(row: RecipeRow): Recipe {
  const ingredients = JSON.parse(row.ingredients) as Ingredient[];
  const recipe: Recipe = {
    id: row.id,
    title: row.title,
    ingredients,
    instructions: row.instructions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.image_uri ? { imageUri: row.image_uri } : {}),
  };
  return recipe;
}

export const RecipeRepository = {
  async list(search?: string): Promise<Recipe[]> {
    const db = await getDb();
    const rows = search && search.trim().length > 0
      ? await db.getAllAsync<RecipeRow>(
          `SELECT * FROM recipes WHERE title LIKE ? ORDER BY updated_at DESC`,
          [`%${search.trim()}%`]
        )
      : await db.getAllAsync<RecipeRow>(
          `SELECT * FROM recipes ORDER BY updated_at DESC`
        );
    return rows.map(rowToRecipe);
  },

  async getById(id: string): Promise<Recipe | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<RecipeRow>(
      `SELECT * FROM recipes WHERE id = ? LIMIT 1`,
      [id]
    );
    return row ? rowToRecipe(row) : null;
  },

  async create(draft: RecipeDraft): Promise<Recipe> {
    const db = await getDb();
    const now = Date.now();
    const recipe: Recipe = {
      id: newId(),
      title: draft.title,
      ingredients: draft.ingredients,
      instructions: draft.instructions,
      createdAt: now,
      updatedAt: now,
      ...(draft.imageUri ? { imageUri: draft.imageUri } : {}),
    };
    await db.runAsync(
      `INSERT INTO recipes (id, title, ingredients, instructions, image_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.id,
        recipe.title,
        JSON.stringify(recipe.ingredients),
        recipe.instructions,
        recipe.imageUri ?? null,
        recipe.createdAt,
        recipe.updatedAt,
      ]
    );
    return recipe;
  },

  async update(id: string, draft: RecipeDraft): Promise<Recipe | null> {
    const db = await getDb();
    const existing = await this.getById(id);
    if (!existing) return null;

    // If image changed, purge the old one.
    if (existing.imageUri && existing.imageUri !== draft.imageUri) {
      await deleteImage(existing.imageUri);
    }

    const now = Date.now();
    const updated: Recipe = {
      id,
      title: draft.title,
      ingredients: draft.ingredients,
      instructions: draft.instructions,
      createdAt: existing.createdAt,
      updatedAt: now,
      ...(draft.imageUri ? { imageUri: draft.imageUri } : {}),
    };
    await db.runAsync(
      `UPDATE recipes
       SET title = ?, ingredients = ?, instructions = ?, image_uri = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.title,
        JSON.stringify(updated.ingredients),
        updated.instructions,
        updated.imageUri ?? null,
        updated.updatedAt,
        id,
      ]
    );
    return updated;
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    const existing = await this.getById(id);
    if (existing?.imageUri) await deleteImage(existing.imageUri);
    await db.runAsync(`DELETE FROM recipes WHERE id = ?`, [id]);
  },
};
