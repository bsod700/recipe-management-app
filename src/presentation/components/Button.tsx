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
  primary: '',
  secondary: '',
  danger: '',
};

const variantTextClassName: Record<Variant, string> = {
  primary: '',
  secondary: '',
  danger: '',
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
      className={`${variantClassName[variant]} ${isInactive ? 'opacity-50' : ''}`}
      style={{
        minHeight: theme.minTouchTarget,
        borderRadius: theme.radius.lg,
        backgroundColor:
          variant === 'primary'
            ? theme.colors.accent
            : variant === 'danger'
              ? theme.colors.danger
              : theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: 'rgba(99,48,19,0.1)',
      }}
    >
      {loading ? (
        <ButtonSpinner color={variant === 'secondary' ? theme.colors.text : '#FEFDFB'} />
      ) : (
        <>
          {icon ? (
            <ButtonIcon
              as={icon}
              className={variantTextClassName[variant]}
              style={{ color: variant === 'secondary' ? theme.colors.text : '#FEFDFB' }}
            />
          ) : null}
          <ButtonText
            className={`text-base font-bold ${variantTextClassName[variant]}`}
            style={{ color: variant === 'secondary' ? theme.colors.text : '#FEFDFB' }}
          >
            {label}
          </ButtonText>
        </>
      )}
    </GluestackButton>
  );
});
