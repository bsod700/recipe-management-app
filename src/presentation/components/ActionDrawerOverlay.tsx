import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';

export interface DrawerAction {
  readonly key: string;
  readonly label: string;
  readonly tone: 'default' | 'danger';
  readonly onPress: () => void;
}

interface Props {
  readonly isOpen: boolean;
  readonly title: string;
  readonly actions: ReadonlyArray<DrawerAction>;
  readonly onClose: () => void;
}

export function ActionDrawerOverlay({
  isOpen,
  title,
  actions,
  onClose,
}: Props): React.ReactElement {
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen) return;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, opacity, translateY]);

  const indicator = useMemo(
    () => (
      <View
        style={{
          width: 54,
          height: 4,
          borderRadius: 99,
          backgroundColor: 'rgba(99,48,19,0.20)',
        }}
      />
    ),
    []
  );

  return (
    <Modal transparent visible={isOpen} animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={{
            ...ViewStyleSheet.absoluteFillObject,
            backgroundColor: theme.colors.overlay,
            opacity,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={{
            marginHorizontal: 8,
            marginBottom: 8,
            borderRadius: 26,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: 'rgba(99,48,19,0.05)',
            padding: 16,
            transform: [{ translateY }],
            shadowColor: '#633013',
            shadowOpacity: 0.2,
            shadowRadius: 25,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
          }}
        >
          <View style={{ gap: 16 }}>
            <View style={{ gap: 16, alignItems: 'center' }}>
              {indicator}
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 18 }}>
                {title}
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {actions.map((action) => {
                const isDanger = action.tone === 'danger';
                return (
                  <Pressable
                    key={action.key}
                    onPress={action.onPress}
                    style={{
                      minHeight: 56,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(99,48,19,0.10)',
                      backgroundColor: isDanger ? theme.colors.accent : theme.colors.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 24,
                    }}
                  >
                    <Text
                      style={{
                        color: isDanger ? '#FEFDFB' : theme.colors.text,
                        fontWeight: '700',
                        fontSize: 16,
                      }}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const ViewStyleSheet = {
  absoluteFillObject: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};
