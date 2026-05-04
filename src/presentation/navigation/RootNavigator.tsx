import React from 'react';
import { I18nManager } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { HomeScreen } from '@presentation/screens/HomeScreen';
import { DetailScreen } from '@presentation/screens/DetailScreen';
import { EditScreen } from '@presentation/screens/EditScreen';
import { SearchRecipesScreen } from '@presentation/screens/SearchRecipesScreen';
import { theme } from '@shared/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation: I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SearchRecipes" component={SearchRecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={DetailScreen} />
      <Stack.Screen name="RecipeEdit" component={EditScreen} />
    </Stack.Navigator>
  );
}
