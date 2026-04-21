import React from 'react';
import { I18nManager } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { ListScreen } from '@presentation/screens/ListScreen';
import { DetailScreen } from '@presentation/screens/DetailScreen';
import { EditScreen } from '@presentation/screens/EditScreen';
import { theme } from '@shared/theme/theme';
import { strings } from '@shared/i18n/he';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="RecipeList"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontSize: 18, fontWeight: '700' },
        headerBackTitle: strings.screens.edit.actions.cancel,
        contentStyle: { backgroundColor: theme.colors.bg },
        statusBarColor: theme.colors.bg,
        navigationBarColor: theme.colors.bg,
        animation: I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="RecipeList"
        component={ListScreen}
        options={{ title: strings.screens.list.title }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={DetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="RecipeEdit"
        component={EditScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
