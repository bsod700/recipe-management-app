import React, { memo } from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import type { Recipe } from '@domain/entities/Recipe';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly recipe: Recipe;
  readonly onPress: (id: string) => void;
}

function RecipeCardInner({ recipe, onPress }: Props): React.ReactElement {
  return (
    <Pressable
      onPress={() => onPress(recipe.id)}
      accessibilityRole="button"
      accessibilityLabel={`${strings.a11y.recipeCard}: ${recipe.title}`}
      android_ripple={{ color: theme.colors.surfaceAlt }}
      style={{
        minHeight: theme.minTouchTarget + 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        gap: theme.spacing.md,
      }}
    >
      {recipe.imageUri ? (
        <Image
          source={{ uri: recipe.imageUri }}
          accessibilityLabel={strings.a11y.recipeImage}
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        />
      ) : (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 28 }}>🍲</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          className="text-lg font-bold text-text text-left"
        >
          {recipe.title}
        </Text>
        <Text className="text-base text-textMuted text-left mt-1">
          {recipe.ingredients.length}{' '}
          {recipe.ingredients.length === 1 ? 'מרכיב' : 'מרכיבים'}
        </Text>
        <Text className="text-sm text-textMuted text-left mt-1">
          ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} דק׳ · 🍽️ {recipe.servings}
        </Text>
      </View>
    </Pressable>
  );
}

export const RecipeCard = memo(RecipeCardInner);
