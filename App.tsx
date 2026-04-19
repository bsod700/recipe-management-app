import './global.css';

import React, { useEffect, useState } from 'react';
import { I18nManager, StatusBar, View, ActivityIndicator, DevSettings, Text, TextInput } from 'react-native';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { RootNavigator } from '@presentation/navigation/RootNavigator';
import { theme } from '@shared/theme/theme';
import { getDb } from '@data/db/database';
import { ensureImageDir } from '@shared/utils/images';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.accent,
    notification: theme.colors.accent,
  },
};

const textDefaultProps = (Text as typeof Text & { defaultProps?: Record<string, unknown> }).defaultProps ?? {};
(Text as typeof Text & { defaultProps?: Record<string, unknown> }).defaultProps = {
  ...textDefaultProps,
  style: [{ writingDirection: 'rtl', textAlign: 'right' }, textDefaultProps.style].filter(Boolean),
};

const textInputDefaultProps = (TextInput as typeof TextInput & { defaultProps?: Record<string, unknown> }).defaultProps ?? {};
(TextInput as typeof TextInput & { defaultProps?: Record<string, unknown> }).defaultProps = {
  ...textInputDefaultProps,
  style: [{ writingDirection: 'rtl', textAlign: 'right' }, textInputDefaultProps.style].filter(Boolean),
};

export default function App(): React.ReactElement {
  const [rtlReady, setRtlReady] = useState(I18nManager.isRTL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ensureRTL = async (): Promise<void> => {
      I18nManager.allowRTL(true);
      I18nManager.swapLeftAndRightInRTL(true);
      if (!I18nManager.isRTL) {
        I18nManager.forceRTL(true);
        try {
          await Updates.reloadAsync();
          return;
        } catch {
          if (__DEV__) {
            DevSettings.reload();
            return;
          }
          // Never block app startup if reload is unavailable on device.
          if (mounted) setRtlReady(true);
          return;
        }
      }
      if (mounted) setRtlReady(true);
    };
    void ensureRTL();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!rtlReady) return;
    let mounted = true;
    (async () => {
      await getDb();
      await ensureImageDir();
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [rtlReady]);

  if (!rtlReady || !ready) {
    return (
      <View
        style={{
          flex: 1,
          direction: 'rtl',
          backgroundColor: theme.colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.accent} size="large" />
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.bg}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: 'rtl' }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.bg}
        />
        <NavigationContainer theme={navTheme} direction="rtl">
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
