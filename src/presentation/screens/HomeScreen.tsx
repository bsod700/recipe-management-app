import React, { useCallback, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@presentation/navigation/types';
import { useCategories } from '@application/hooks/useCategories';
import { useRecipesWithFilters } from '@application/hooks/useRecipes';
import { CategoryChips } from '@presentation/components/CategoryChips';
import { BottomMenu } from '@presentation/components/BottomMenu';
import { HomeHeader } from '@presentation/components/HomeHeader';
import { RecipeResultsList } from '@presentation/components/RecipeResultsList';
import { ScreenBackgroundPattern } from '@presentation/components/ScreenBackgroundPattern';
import { figmaAssets } from '@presentation/assets/figmaAssets';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<Nav>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { categories, refresh: refreshCategories } = useCategories();
  const { recipes, loading, error, refresh } = useRecipesWithFilters({
    search: '',
    category: selectedCategory,
  });
  const { recipes: allRecipes, refresh: refreshAll } = useRecipesWithFilters({
    search: '',
    category: 'all',
  });

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshAll();
      void refreshCategories();
    }, [refresh, refreshAll, refreshCategories])
  );

  const hasRecipes = allRecipes.length > 0;
  const homeTitle = useMemo(
    () => (hasRecipes ? 'הבטן שלי מקרקרת\nמה מכינים היום?' : 'הבטן שלי מקרקרת\nהוסיפו מתכון, שנתחיל לבשל?'),
    [hasRecipes]
  );

  const openDetail = useCallback(
    (id: string) => navigation.navigate('RecipeDetail', { id }),
    [navigation]
  );
  const openAdd = useCallback(() => navigation.navigate('RecipeEdit', {}), [navigation]);
  const openSearch = useCallback(
    () => navigation.navigate('SearchRecipes', { category: selectedCategory }),
    [navigation, selectedCategory]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 24 }}>
        <ScreenBackgroundPattern />
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          {loading && !hasRecipes ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.text }}>טוען...</Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.danger, fontSize: 16, textAlign: 'center' }}>
                טעינת המתכונים נכשלה
              </Text>
            </View>
          ) : !hasRecipes ? (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{ width: '100%', alignItems: 'center', gap: 32 }}>
                <Image
                  source={figmaAssets.homeEmptyNib}
                  style={{ width: 343, height: 423 }}
                  resizeMode="contain"
                />
                <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 29,
                      textAlign: 'center',
                      fontWeight: '700',
                      lineHeight: 36,
                    }}
                  >
                    {homeTitle}
                  </Text>
                  <Image
                    source={figmaAssets.homeEmptyArrow}
                    style={{ width: 45, height: 90 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, width: '100%', gap: 16 }}>
              <HomeHeader title={homeTitle} showMascot />
              <CategoryChips
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              <RecipeResultsList recipes={recipes} onPressRecipe={openDetail} />
            </View>
          )}

          <BottomMenu
            onPressHome={() => navigation.navigate('Home')}
            onPressSearch={openSearch}
            onPressAdd={openAdd}
            active="home"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
