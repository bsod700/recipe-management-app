import React, { useCallback, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import type { RootStackParamList } from '@presentation/navigation/types';
import { useRecipes } from '@application/hooks/useRecipes';
import { useRecipeMutations } from '@application/hooks/useRecipeMutations';
import { SearchBar } from '@presentation/components/SearchBar';
import { RecipeCard } from '@presentation/components/RecipeCard';
import { FAB } from '@presentation/components/FAB';
import { ListDeleteRecipeAction } from '@presentation/components/ListDeleteRecipeAction';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import type { Recipe } from '@domain/entities/Recipe';

type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeList'>;

export function ListScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState<string>('');
  const { recipes, loading, error, refresh } = useRecipes(search);
  const { remove, deleting } = useRecipeMutations();

  // Refresh when the screen regains focus (e.g. after returning from Edit).
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const openDetail = useCallback(
    (id: string) => navigation.navigate('RecipeDetail', { id }),
    [navigation]
  );

  const openAdd = useCallback(
    () => navigation.navigate('RecipeEdit', {}),
    [navigation]
  );

  const handleDeleteRecipe = useCallback(
    async (id: string): Promise<void> => {
      try {
        await remove(id);
        await refresh();
      } catch {
        Alert.alert(strings.app.name, strings.errors.deleteFailed);
      }
    },
    [refresh, remove]
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <Swipeable
        renderRightActions={() => (
          <ListDeleteRecipeAction
            recipeId={item.id}
            deleting={deleting}
            onConfirmDelete={handleDeleteRecipe}
          />
        )}
        overshootRight={false}
        rightThreshold={40}
      >
        <RecipeCard recipe={item} onPress={openDetail} />
      </Swipeable>
    ),
    [deleting, handleDeleteRecipe, openDetail]
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg, flex: 1 }}>
        <SearchBar value={search} onChange={setSearch} />

        {loading && recipes.length === 0 ? (
          <View style={{ flex: 1, gap: theme.spacing.md }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
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
                <Skeleton
                  variant="rounded"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: theme.radius.md,
                  }}
                />
                <View style={{ flex: 1, gap: theme.spacing.sm }}>
                  <Skeleton
                    variant="rounded"
                    style={{ width: '72%', height: 20, borderRadius: theme.radius.sm }}
                  />
                  <Skeleton
                    variant="rounded"
                    style={{ width: '38%', height: 14, borderRadius: theme.radius.sm }}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-lg text-error-500 text-center">
              {strings.errors.loadFailed}
            </Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-lg text-typography-500 text-center">
              {search.length > 0
                ? strings.screens.list.emptySearch
                : strings.screens.list.empty}
            </Text>
          </View>
        ) : (
          <FlatList
            data={recipes as Recipe[]}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={() => (
              <View style={{ height: theme.spacing.md }} />
            )}
            contentContainerStyle={{ paddingBottom: 96 }}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews
            initialNumToRender={10}
            windowSize={7}
          />
        )}
      </View>

      <FAB
        onPress={openAdd}
        accessibilityLabel={strings.a11y.addRecipeButton}
      />
    </SafeAreaView>
  );
}
