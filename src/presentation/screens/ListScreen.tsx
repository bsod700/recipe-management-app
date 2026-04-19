import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
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

  const confirmDelete = useCallback(
    (recipe: Recipe) => {
      Alert.alert(
        strings.screens.list.confirmDelete.title,
        strings.screens.list.confirmDelete.message,
        [
          { text: strings.screens.list.confirmDelete.cancel, style: 'cancel' },
          {
            text: strings.screens.list.confirmDelete.confirm,
            style: 'destructive',
            onPress: async () => {
              try {
                await remove(recipe.id);
                await refresh();
              } catch {
                Alert.alert(strings.app.name, strings.errors.deleteFailed);
              }
            },
          },
        ]
      );
    },
    [refresh, remove]
  );

  const renderDeleteAction = useCallback(
    (recipe: Recipe) => (
      <View
        style={{
          width: 92,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable
          onPress={() => confirmDelete(recipe)}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.swipeDeleteRecipe}
          disabled={deleting}
          style={{
            minHeight: theme.minTouchTarget,
            minWidth: theme.minTouchTarget,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.danger,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.md,
            gap: theme.spacing.xs,
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 18 }}>🗑️</Text>
          <Text className="text-sm font-bold text-text">
            {strings.screens.list.swipeDelete}
          </Text>
        </Pressable>
      </View>
    ),
    [confirmDelete, deleting]
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <Swipeable
        renderRightActions={() => renderDeleteAction(item)}
        overshootRight={false}
        rightThreshold={40}
      >
        <RecipeCard recipe={item} onPress={openDetail} />
      </Swipeable>
    ),
    [openDetail, renderDeleteAction]
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg, flex: 1 }}>
        <SearchBar value={search} onChange={setSearch} />

        {loading && recipes.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-lg text-danger text-center">
              {strings.errors.loadFailed}
            </Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-lg text-textMuted text-center">
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
