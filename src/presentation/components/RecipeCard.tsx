import React, { memo } from 'react';
import { Image, View } from 'react-native';
import { Clock3, UtensilsCrossed } from 'lucide-react-native';
import type { Recipe } from '@domain/entities/Recipe';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { Pressable } from '@/components/ui/pressable';
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
      style={{
        backgroundColor: 'rgba(224,207,191,0.25)',
        borderColor: 'rgba(99,48,19,0.1)',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 8,
        gap: 16,
      }}
    >
      <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
        <View style={{ width: '100%', alignItems: 'flex-start' }}>
          {recipe.category ? (
            <View
                style={{
                  borderRadius: 32,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: theme.colors.accent,
                }}
              >
                <Text style={{ color: '#FEFDFB', fontWeight: '600', fontSize: 12 }}>
                  {recipe.category}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            numberOfLines={1}
            style={{ color: theme.colors.text, fontWeight: '700', fontSize: 28 }}
          >
            {recipe.title}
          </Text>
        
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>
              {recipe.servings}
            </Text>
            <Icon as={UtensilsCrossed} size="sm" style={{ color: theme.colors.text }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>
              {recipe.prepTimeMinutes + recipe.cookTimeMinutes} דקות
            </Text>
            <Icon as={Clock3} size="sm" style={{ color: theme.colors.text }} />
          </View>
        </View>
      </View>

      {recipe.imageUri ? (
        <Image
          source={{ uri: recipe.imageUri }}
          accessibilityLabel={strings.a11y.recipeImage}
          style={{
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        />
      ) : (
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              textAlign: 'center',
              marginTop: 40,
              fontSize: 12,
            }}
          >
            אין תמונה
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export const RecipeCard = memo(RecipeCardInner);
