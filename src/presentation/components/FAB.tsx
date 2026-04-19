import React, { memo } from 'react';
import { Pressable, Text } from 'react-native';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly onPress: () => void;
  readonly accessibilityLabel: string;
  readonly icon?: string;
}

function FABInner({ onPress, accessibilityLabel, icon = '+' }: Props): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: theme.colors.accentPressed, borderless: true }}
      style={{
        position: 'absolute',
        bottom: theme.spacing.xl + 48,
        // RTL: place the FAB on the left so it doesn't collide with scroll
        // indicators or gesture areas on the natural "end" edge.
        left: theme.spacing.xl,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Text style={{ fontSize: 32, color: theme.colors.bg, fontWeight: '700' }}>
        {icon}
      </Text>
    </Pressable>
  );
}

export const FAB = memo(FABInner);
