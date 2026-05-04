import React from 'react';
import { Image, Modal, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly illustrationUri?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ExitConfirmAlertOverlay({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  illustrationUri,
  onConfirm,
  onCancel,
}: Props): React.ReactElement {
  return (
    <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            borderRadius: 26,
            borderTopWidth: 1,
            borderTopColor: 'rgba(99,48,19,0.05)',
            backgroundColor: theme.colors.surface,
            padding: 16,
            gap: 24,
          }}
        >
          <View style={{ gap: 8, alignItems: 'center' }}>
            <View
              style={{
                width: 54,
                height: 4,
                borderRadius: 99,
                backgroundColor: 'rgba(99,48,19,0.20)',
              }}
            />
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 18 }}>
              {title}
            </Text>
            {illustrationUri ? (
              <Image
                source={{ uri: illustrationUri }}
                style={{ width: 199, height: 232 }}
                resizeMode="contain"
              />
            ) : null}
            <Text style={{ color: theme.colors.text, textAlign: 'center', fontSize: 18 }}>
              {message}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                minHeight: 56,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(99,48,19,0.10)',
                backgroundColor: theme.colors.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>
                {confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                minHeight: 56,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(99,48,19,0.10)',
                backgroundColor: theme.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FEFDFB', fontWeight: '700', fontSize: 16 }}>
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
