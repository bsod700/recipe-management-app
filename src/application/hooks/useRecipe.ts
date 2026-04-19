import { useCallback, useEffect, useState } from 'react';
import type { Recipe } from '@domain/entities/Recipe';
import { RecipeRepository } from '@data/repositories/RecipeRepository';

export function useRecipe(id: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!id) {
      setRecipe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await RecipeRepository.getById(id);
      setRecipe(r);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { recipe, loading, error, reload: load };
}
