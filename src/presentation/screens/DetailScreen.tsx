import React, { useLayoutEffect } from 'react';
import { Clock3, Flame, Pencil, UtensilsCrossed } from 'lucide-react-native';
import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import { useRecipe } from '@application/hooks/useRecipe';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
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

export function DetailScreen(): React.ReactElement {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();
  const { id } = route.params;
  const { recipe, loading } = useRecipe(id);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: recipe?.title ?? '',
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate('RecipeEdit', { id })}
          action="secondary"
          variant="solid"
          hitSlop={12}
          className="border border-outline-500"
          style={{
            paddingHorizontal: theme.spacing.md,
            minHeight: theme.minTouchTarget,
            borderRadius: theme.radius.md,
          }}
        >
          <ButtonText className="text-base text-primary-500 font-bold">
            {strings.screens.detail.edit}
          </ButtonText>
          <ButtonIcon as={Pencil} size="sm" className="text-primary-500" />
        </Button>
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
        <Text className="text-lg text-error-500">{strings.errors.loadFailed}</Text>
      </View>
    );
  }

  const instructionSteps = parseInstructionSteps(recipe.instructions);
  const statsCards = [
    {
      key: 'prep',
      icon: Clock3,
      label: strings.screens.detail.prepTime,
      value: `${recipe.prepTimeMinutes} ${strings.screens.detail.minutesUnit}`,
    },
    {
      key: 'cook',
      icon: Flame,
      label: strings.screens.detail.cookTime,
      value: `${recipe.cookTimeMinutes} ${strings.screens.detail.minutesUnit}`,
    },
    {
      key: 'servings',
      icon: UtensilsCrossed,
      label: strings.screens.detail.servings,
      value: `${recipe.servings} ${strings.screens.detail.servingsUnit}`,
    },
  ] as const;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        style={{ backgroundColor: theme.colors.bg }}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.xl }}
      >
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

        <View style={{ gap: theme.spacing.lg }} >
          <Text className="text-xl font-bold text-typography-950">
            {strings.screens.detail.statsHeading}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: theme.spacing.md,
            }}
          >
            {statsCards.map((card) => (
              <View
                key={card.key}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.md,
                  gap: theme.spacing.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                  <Icon as={card.icon} size="sm" className="text-primary-500" />
                  <Text className="text-sm text-typography-950">
                    {card.label}
                  </Text>
                  
                </View>
                <Text className="text-lg font-bold text-typography-950">
                  {card.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Text className="text-xl font-bold text-typography-950">
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
                <Text className="text-base text-typography-950 font-semibold">
                  {ing.name}
                </Text>
                <Text className="text-base text-typography-500">
                  {ing.amount} {unitLabel(ing.unit)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Text className="text-xl font-bold text-typography-950">
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
                  <Text className="text-base text-primary-500 font-bold">
                    {formatStepNumber(index)}
                  </Text>
                  <Text
                    className="text-base text-typography-950"
                    style={{
                      flex: 1,
                      lineHeight: 24,
                    }}
                  >
                    {step}
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
