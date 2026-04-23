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
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

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

const rtlTextStyle = { writingDirection: 'rtl', textAlign: 'right' } as const;

const applyGlobalRTLTextDefaults = (): void => {
  const textComponent = Text as typeof Text & {
    defaultProps?: React.ComponentProps<typeof Text>;
  };
  const textDefaults = textComponent.defaultProps ?? {};
  const textDefaultStyle = textDefaults.style;
  textComponent.defaultProps = {
    ...textDefaults,
    style: Array.isArray(textDefaultStyle)
      ? [rtlTextStyle, ...textDefaultStyle]
      : [rtlTextStyle, textDefaultStyle],
  };

  const inputComponent = TextInput as typeof TextInput & {
    defaultProps?: React.ComponentProps<typeof TextInput>;
  };
  const inputDefaults = inputComponent.defaultProps ?? {};
  const inputDefaultStyle = inputDefaults.style;
  inputComponent.defaultProps = {
    ...inputDefaults,
    textAlign: 'left',
    style: Array.isArray(inputDefaultStyle)
      ? [rtlTextStyle, ...inputDefaultStyle]
      : [rtlTextStyle, inputDefaultStyle],
  };
};

applyGlobalRTLTextDefaults();

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
    <GluestackUIProvider mode="dark">
      <GestureHandlerRootView
        style={{ flex: 1, direction: 'rtl', backgroundColor: theme.colors.bg }}
      >
        <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.colors.bg }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.bg}
          />
          <NavigationContainer theme={navTheme} direction="rtl">
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </GluestackUIProvider>
  );
}
