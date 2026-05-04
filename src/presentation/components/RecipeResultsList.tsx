import React, { memo } from 'react';
import { FlatList, View } from 'react-native';
import type { Recipe } from '@domain/entities/Recipe';
import { RecipeCard } from '@presentation/components/RecipeCard';

interface Props {
  readonly recipes: ReadonlyArray<Recipe>;
  readonly onPressRecipe: (id: string) => void;
}

function RecipeResultsListInner({ recipes, onPressRecipe }: Props): React.ReactElement {
  return (
    <FlatList
      data={recipes as Recipe[]}
      renderItem={({ item }) => <RecipeCard recipe={item} onPress={onPressRecipe} />}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      contentContainerStyle={{ paddingBottom: 130 }}
      keyboardShouldPersistTaps="handled"
    />
  );
}

export const RecipeResultsList = memo(RecipeResultsListInner);
