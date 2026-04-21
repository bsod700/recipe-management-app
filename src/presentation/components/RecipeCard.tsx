import React, { memo } from 'react';
import { Image } from 'react-native';
import { ChefHat, Clock3, UtensilsCrossed } from 'lucide-react-native';
import type { Recipe } from '@domain/entities/Recipe';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

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
      className="bg-secondary-500 border border-outline-500"
      style={{
        minHeight: theme.minTouchTarget + 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radius.lg,
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
            backgroundColor: theme.colors.bg,
          }}
        />
      ) : (
        <Box
          className="bg-background-0"
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon as={ChefHat} size="xl" className="text-primary-500" />
        </Box>
      )}

      <Box style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          className="text-lg font-bold text-typography-950 text-left"
        >
          {recipe.title}
        </Text>
        <Text className="text-base text-typography-500 text-left mt-1">
          {recipe.ingredients.length}{' '}
          {recipe.ingredients.length === 1 ? 'מרכיב' : 'מרכיבים'}
        </Text>
        <Box
          style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}
        >
          <Icon as={Clock3} size="xs" className="text-typography-500" />
          <Text className="text-sm text-typography-500">
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} דק׳
          </Text>
          <Icon as={UtensilsCrossed} size="xs" className="text-typography-500" />
          <Text className="text-sm text-typography-500">{recipe.servings}</Text>
        </Box>
      </Box>
    </Pressable>
  );
}

export const RecipeCard = memo(RecipeCardInner);
