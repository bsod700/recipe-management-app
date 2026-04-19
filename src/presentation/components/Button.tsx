import React, { memo } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { theme } from '@shared/theme/theme';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: Variant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent active:bg-accentPressed',
  secondary: 'bg-surfaceAlt active:opacity-80 border border-border',
  danger: 'bg-danger active:opacity-80',
};

const variantTextColor: Record<Variant, string> = {
  primary: 'text-bg',
  secondary: 'text-text',
  danger: 'text-text',
};

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
}: Props): React.ReactElement {
  const isInactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      testID={testID}
      style={{ minHeight: theme.minTouchTarget }}
      className={`rounded-card px-5 justify-center items-center ${variantClass[variant]} ${isInactive ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.bg} />
      ) : (
        <Text className={`text-base font-bold ${variantTextColor[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
});
