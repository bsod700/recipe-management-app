import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '@shared/theme/theme';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';

interface Props {
  readonly onPress: () => void;
  readonly accessibilityLabel: string;
  readonly icon?: LucideIcon;
}

function FABInner({
  onPress,
  accessibilityLabel,
  icon = Plus,
}: Props): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="bg-primary-500 items-center justify-center"
      style={{
        position: 'absolute',
        bottom: theme.spacing.xl + 48,
        // RTL: place the FAB on the left so it doesn't collide with scroll
        // indicators or gesture areas on the natural "end" edge.
        left: theme.spacing.xl,
        width: 64,
        height: 64,
        borderRadius: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Icon as={icon} size="xl" className="text-typography-0" />
    </Pressable>
  );
}

export const FAB = memo(FABInner);
