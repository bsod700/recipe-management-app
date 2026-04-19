import { useCallback, useState } from 'react';
import type { Recipe, RecipeDraft } from '@domain/entities/Recipe';
import { RecipeRepository } from '@data/repositories/RecipeRepository';

export function useRecipeMutations() {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const create = useCallback(async (draft: RecipeDraft): Promise<Recipe> => {
    setSaving(true);
    try {
      return await RecipeRepository.create(draft);
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, draft: RecipeDraft): Promise<Recipe | null> => {
      setSaving(true);
      try {
        return await RecipeRepository.update(id, draft);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    setDeleting(true);
    try {
      await RecipeRepository.remove(id);
    } finally {
      setDeleting(false);
    }
  }, []);

  return { create, update, remove, saving, deleting };
}
