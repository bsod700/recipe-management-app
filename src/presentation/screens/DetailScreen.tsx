import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import { useRecipe } from '@application/hooks/useRecipe';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { UNIT_OPTIONS } from '@shared/constants/units';
import type { IngredientUnit } from '@domain/entities/Recipe';
import { formatStepNumber, parseInstructionSteps } from '@shared/utils/instructions';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeDetail'>;

function unitLabel(unit: IngredientUnit): string {
  return UNIT_OPTIONS.find((u) => u.value === unit)?.label ?? unit;
}

function forceRtlText(value: string): string {
  const RTL_EMBEDDING = '\u202B';
  const POP_DIRECTIONAL_FORMATTING = '\u202C';
  const RTL_MARK = '\u200F';
  return value
    .split('\n')
    .map((line) => `${RTL_EMBEDDING}${RTL_MARK}${line}${POP_DIRECTIONAL_FORMATTING}`)
    .join('\n');
}

export function DetailScreen(): React.ReactElement {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();
  const { id } = route.params;
  const { recipe, loading } = useRecipe(id);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: recipe?.title ?? '',
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('RecipeEdit', { id })}
          accessibilityRole="button"
          hitSlop={12}
          style={{
            paddingHorizontal: theme.spacing.md,
            minHeight: theme.minTouchTarget,
            justifyContent: 'center',
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text className="text-base text-accent font-bold">
            {strings.screens.detail.edit}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, recipe?.title, id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-lg text-danger">{strings.errors.loadFailed}</Text>
      </View>
    );
  }

  const instructionSteps = parseInstructionSteps(recipe.instructions);

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.xl }}>
        {recipe.imageUri ? (
          <Image
            source={{ uri: recipe.imageUri }}
            accessibilityLabel={strings.a11y.recipeImage}
            style={{
              width: '100%',
              height: 220,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface,
            }}
            resizeMode="cover"
          />
        ) : null}

        <View style={{ gap: theme.spacing.md }}>
          <Text className="text-xl font-bold text-text text-right">
            {strings.screens.detail.statsHeading}
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text className="text-base text-text text-right">
                ⏱️ {strings.screens.detail.prepTime}
              </Text>
              <Text className="text-base font-semibold text-text">
                {recipe.prepTimeMinutes} {strings.screens.detail.minutesUnit}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text className="text-base text-text text-right">
                🔥 {strings.screens.detail.cookTime}
              </Text>
              <Text className="text-base font-semibold text-text">
                {recipe.cookTimeMinutes} {strings.screens.detail.minutesUnit}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text className="text-base text-text text-right">
                🍽️ {strings.screens.detail.servings}
              </Text>
              <Text className="text-base font-semibold text-text">
                {recipe.servings} {strings.screens.detail.servingsUnit}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Text className="text-xl font-bold text-text text-right">
            {strings.screens.detail.ingredientsHeading}
          </Text>
          <View style={{ gap: theme.spacing.sm }}>
            {recipe.ingredients.map((ing, idx) => (
              <View
                key={`${ing.name}-${idx}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text className="text-base text-text text-right font-semibold">
                  {ing.name}
                </Text>
                <Text className="text-base text-textMuted">
                  {ing.amount} {unitLabel(ing.unit)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Text className="text-xl font-bold text-text text-right">
            {strings.screens.detail.instructionsHeading}
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
            }}
          >
            <View style={{ gap: theme.spacing.md }}>
              {instructionSteps.map((step, index) => (
                <View
                  key={`${step}-${index}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: theme.spacing.md,
                  }}
                >
                  <Text className="text-base text-accent font-bold">
                    {formatStepNumber(index)}
                  </Text>
                  <Text
                    className="text-base text-text"
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      writingDirection: 'rtl',
                      lineHeight: 24,
                    }}
                  >
                    {forceRtlText(step)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
