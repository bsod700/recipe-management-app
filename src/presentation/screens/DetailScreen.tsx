import React, { useCallback, useMemo, useState } from 'react';
import { ArrowRight, Clock3, Ellipsis, Flame, UtensilsCrossed } from 'lucide-react-native';
import { Alert, Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import { useRecipe } from '@application/hooks/useRecipe';
import { useRecipeMutations } from '@application/hooks/useRecipeMutations';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { ActionDrawerOverlay } from '@presentation/components/ActionDrawerOverlay';
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
  const { remove } = useRecipeMutations();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const statsCards = useMemo(() => {
    if (!recipe) return [] as const;
    return [
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
  }, [recipe]);

  const openEdit = useCallback(() => {
    setDrawerOpen(false);
    navigation.navigate('RecipeEdit', { id });
  }, [id, navigation]);

  const onDelete = useCallback(() => {
    setDrawerOpen(false);
    Alert.alert(strings.screens.edit.confirmDelete.title, strings.screens.edit.confirmDelete.message, [
      { text: strings.screens.edit.confirmDelete.cancel, style: 'cancel' },
      {
        text: strings.screens.edit.confirmDelete.confirm,
        style: 'destructive',
        onPress: async () => {
          await remove(id);
          navigation.popToTop();
        },
      },
    ]);
  }, [id, navigation, remove]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg }}>
        <Text style={{ color: theme.colors.text }}>טוען...</Text>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        style={{ backgroundColor: theme.colors.bg }}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl + 24 }}
      >
        <View style={{ height: 400, marginBottom: 24 }}>
          {recipe.imageUri ? (
            <Image
              source={{ uri: recipe.imageUri }}
              accessibilityLabel={strings.a11y.recipeImage}
              style={{ width: '100%', height: 400 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: theme.colors.surfaceAlt }} />
          )}
          <View
            style={{
              position: 'absolute',
              top: 48,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => setDrawerOpen(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.accent,
              }}
            >
              <Icon as={Ellipsis} size="md" style={{ color: '#FEFDFB' }} />
            </Pressable>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.menu,
              }}
            >
              <Icon as={ArrowRight} size="md" style={{ color: '#FEFDFB' }} />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xl }}>
          <View style={{ gap: 4, alignItems: 'flex-end' }}>
            {recipe.category ? (
              <Text style={{ color: 'rgba(99,48,19,0.60)', fontSize: 18, fontWeight: '700' }}>
                {recipe.category}
              </Text>
            ) : null}
            <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '700' }}>
              {recipe.title}
            </Text>
            {recipe.link ? (
              <Text style={{ color: theme.colors.accent, fontSize: 14 }}>{recipe.link}</Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            {statsCards.map((card) => (
              <View
                key={card.key}
                style={{
                  flex: 1,
                  minHeight: 115,
                  borderRadius: 8,
                  borderColor: 'rgba(99,48,19,0.1)',
                  borderWidth: 1,
                  backgroundColor: 'rgba(224,207,191,0.25)',
                  padding: 16,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <Icon as={card.icon} size="sm" style={{ color: theme.colors.text }} />
                <View style={{ alignSelf: 'stretch' }}>
                  <Text style={{ color: theme.colors.text, fontSize: 12 }}>{card.label}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>
                    {card.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>
              {strings.screens.detail.ingredientsHeading}
            </Text>
            <View style={{ gap: 8 }}>
              {recipe.ingredients.map((ing, idx) => (
                <View
                  key={`${ing.name}-${idx}`}
                  style={{
                    borderRadius: 8,
                    borderColor: 'rgba(99,48,19,0.1)',
                    borderWidth: 1,
                    backgroundColor: 'rgba(224,207,191,0.25)',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {ing.amount} {unitLabel(ing.unit)}
                  </Text>
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{ing.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>
              {strings.screens.detail.instructionsHeading}
            </Text>
            <View
              style={{
                borderRadius: 8,
                borderColor: 'rgba(99,48,19,0.1)',
                borderWidth: 1,
                backgroundColor: theme.colors.surfaceAlt,
                padding: 8,
                gap: 8,
              }}
            >
              {instructionSteps.map((step, index) => (
                <View key={`${step}-${index}`} style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>
                    {formatStepNumber(index)}
                  </Text>
                  <Text style={{ color: theme.colors.text, flex: 1, lineHeight: 22 }}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <ActionDrawerOverlay
        isOpen={isDrawerOpen}
        title="מה תרצו לעשות?"
        onClose={() => setDrawerOpen(false)}
        actions={[
          { key: 'edit', label: 'ערוך מתכון', tone: 'default', onPress: openEdit },
          { key: 'delete', label: 'מחק מתכון', tone: 'danger', onPress: onDelete },
        ]}
      />
    </SafeAreaView>
  );
}
