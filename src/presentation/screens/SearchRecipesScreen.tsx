import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import { useCategories } from '@application/hooks/useCategories';
import { useRecipesWithFilters } from '@application/hooks/useRecipes';
import { SearchBar } from '@presentation/components/SearchBar';
import { CategoryChips } from '@presentation/components/CategoryChips';
import { BottomMenu } from '@presentation/components/BottomMenu';
import { RecipeResultsList } from '@presentation/components/RecipeResultsList';
import { ScreenBackgroundPattern } from '@presentation/components/ScreenBackgroundPattern';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SearchRecipes'>;
type Props = NativeStackScreenProps<RootStackParamList, 'SearchRecipes'>;

export function SearchRecipesScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const [search, setSearch] = useState(route.params?.search ?? '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category ?? 'all');
  const { categories } = useCategories();
  const { recipes, loading } = useRecipesWithFilters({
    search,
    category: selectedCategory,
  });

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
    if (typeof route.params?.search === 'string') {
      setSearch(route.params.search);
    }
  }, [route.params?.category, route.params?.search]);

  const openDetail = useCallback(
    (id: string) => navigation.navigate('RecipeDetail', { id }),
    [navigation]
  );
  const openAdd = useCallback(() => navigation.navigate('RecipeEdit', {}), [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 24 }}>
        <ScreenBackgroundPattern />
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 16 }}>
            <SearchBar value={search} onChange={setSearch} />
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            {loading ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: theme.colors.text }}>טוען...</Text>
              </View>
            ) : (
              <RecipeResultsList recipes={recipes} onPressRecipe={openDetail} />
            )}
          </View>

          <BottomMenu
            onPressHome={() => navigation.navigate('Home', { category: selectedCategory })}
            onPressSearch={() => undefined}
            onPressAdd={openAdd}
            active="search"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
