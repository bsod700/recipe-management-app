import React, { memo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react-native';
import { Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UNIT_OPTIONS } from '@shared/constants/units';
import type { IngredientUnit } from '@domain/entities/Recipe';
import { theme } from '@shared/theme/theme';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';

interface Props {
  readonly value: IngredientUnit;
  readonly onChange: (unit: IngredientUnit) => void;
}

/**
 * Tiny bottom-sheet-style picker. No external deps.
 */
export const UnitPicker = memo(function UnitPicker({
  value,
  onChange,
}: Props): React.ReactElement {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = UNIT_OPTIONS.find((o) => o.value === value) ?? UNIT_OPTIONS[0]!;
  const sheetBottomPadding = insets.bottom + theme.spacing.sm;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="bg-secondary-500 border border-outline-500 rounded-lg"
        style={{
          minHeight: theme.minTouchTarget,
          paddingHorizontal: theme.spacing.lg,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Text className="text-base text-typography-950" style={{ flex: 1 }}>
          {current.label}
        </Text>
        <Icon as={ChevronDown} size="md" className="text-typography-500" />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Box style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          />
          <Box
            className="bg-secondary-500 rounded-t-xl"
            style={{
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: sheetBottomPadding,
            }}
          >
            <FlatList
              data={UNIT_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={{
                    minHeight: theme.minTouchTarget,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Text
                    className={`text-lg ${
                      item.value === value ? 'text-primary-500 font-bold' : 'text-typography-950'
                    }`}
                    style={{ flex: 1 }}
                  >
                    {item.label}
                  </Text>
                  {item.value === value ? (
                    <Box style={{ width: theme.minTouchTarget, alignItems: 'center' }}>
                      <Icon as={Check} size="sm" className="text-primary-500" />
                    </Box>
                  ) : (
                    <Box style={{ width: theme.minTouchTarget }} />
                  )}
                </Pressable>
              )}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
});
