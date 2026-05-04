import { useCallback, useEffect, useState } from 'react';
import { RecipeRepository } from '@data/repositories/RecipeRepository';

interface UseCategoriesState {
  readonly categories: ReadonlyArray<string>;
  readonly loading: boolean;
  readonly error: Error | null;
}

export function useCategories() {
  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async (): Promise<void> => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const categories = await RecipeRepository.listCategories();
      setState({ categories, loading: false, error: null });
    } catch (error) {
      setState({
        categories: [],
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
