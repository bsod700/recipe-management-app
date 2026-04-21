import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '@shared/theme/theme';
import {
  Button as GluestackButton,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from '@/components/ui/button';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: Variant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly accessibilityLabel?: string;
  readonly testID?: string;
  readonly icon?: LucideIcon;
}

const variantAction: Record<Variant, 'primary' | 'secondary' | 'negative'> = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'negative',
};

const variantClassName: Record<Variant, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500 border border-outline-500',
  danger: 'bg-error-500',
};

const variantTextClassName: Record<Variant, string> = {
  primary: 'text-typography-0',
  secondary: 'text-typography-950',
  danger: 'text-typography-0',
};

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
  icon,
}: Props): React.ReactElement {
  const isInactive = disabled || loading;
  return (
    <GluestackButton
      onPress={() => onPress()}
      action={variantAction[variant]}
      variant="solid"
      size="lg"
      isDisabled={isInactive}
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
      style={{ minHeight: theme.minTouchTarget, borderRadius: theme.radius.lg }}
      className={`${variantClassName[variant]} ${isInactive ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ButtonSpinner color={theme.colors.bg} />
      ) : (
        <>
          {icon ? (
            <ButtonIcon as={icon} className={variantTextClassName[variant]} />
          ) : null}
          <ButtonText className={`text-base font-bold ${variantTextClassName[variant]}`}>
            {label}
          </ButtonText>
        </>
      )}
    </GluestackButton>
  );
});
