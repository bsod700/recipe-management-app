import { useCallback, useEffect, useState } from 'react';
import type { Recipe } from '@domain/entities/Recipe';
import { RecipeRepository } from '@data/repositories/RecipeRepository';

interface UseRecipesState {
  readonly recipes: ReadonlyArray<Recipe>;
  readonly loading: boolean;
  readonly error: Error | null;
}

export function useRecipes(search: string) {
  return useRecipesWithFilters({ search, category: 'all' });
}

interface UseRecipesFilters {
  readonly search: string;
  readonly category: string;
}

export function useRecipesWithFilters(filters: UseRecipesFilters) {
  const [state, setState] = useState<UseRecipesState>({
    recipes: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async (query: string, category: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const recipes = await RecipeRepository.list({
        search: query,
        category: category === 'all' ? undefined : category,
      });
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
      void refresh(filters.search, filters.category);
    }, 150);
    return () => clearTimeout(handle);
  }, [filters.category, filters.search, refresh]);

  return {
    ...state,
    refresh: useCallback(
      () => refresh(filters.search, filters.category),
      [filters.category, filters.search, refresh]
    ),
  };
}
