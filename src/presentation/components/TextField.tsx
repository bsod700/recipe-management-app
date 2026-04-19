import { forwardRef } from 'react';
import { TextInput, View, Text } from 'react-native';
import type { TextInputProps } from 'react-native';
import { theme } from '@shared/theme/theme';

interface Props extends Omit<TextInputProps, 'style'> {
  readonly label?: string;
  readonly error?: string | undefined;
  readonly multiline?: boolean;
  readonly minHeight?: number;
}

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, multiline = false, minHeight, ...rest },
  ref
) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="text-base text-text mb-2 font-semibold text-right">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        multiline={multiline}
        textAlign="right"
        textAlignVertical={multiline ? 'top' : 'center'}
        style={{
          minHeight: minHeight ?? (multiline ? 120 : theme.minTouchTarget),
          color: theme.colors.text,
          fontSize: theme.fontBase,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          writingDirection: 'rtl',
        }}
        {...rest}
      />
      {error ? (
        <Text className="text-base text-danger mt-1 text-right">{error}</Text>
      ) : null}
    </View>
  );
});
