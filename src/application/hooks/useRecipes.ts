import { useCallback, useEffect, useState } from 'react';
import type { Recipe } from '@domain/entities/Recipe';
import { RecipeRepository } from '@data/repositories/RecipeRepository';

interface UseRecipesState {
  readonly recipes: ReadonlyArray<Recipe>;
  readonly loading: boolean;
  readonly error: Error | null;
}

export function useRecipes(search: string) {
  const [state, setState] = useState<UseRecipesState>({
    recipes: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async (query: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const recipes = await RecipeRepository.list(query);
      setState({ recipes, loading: false, error: null });
    } catch (err) {
      setState({
        recipes: [],
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, []);

  useEffect(() => {
    // Debounce search input to avoid hammering SQLite on every keystroke.
    const handle = setTimeout(() => {
      void refresh(search);
    }, 150);
    return () => clearTimeout(handle);
  }, [search, refresh]);

  return {
    ...state,
    refresh: useCallback(() => refresh(search), [refresh, search]),
  };
}
