import React, { memo, useState } from 'react';
import { Modal, Pressable, Text, View, FlatList } from 'react-native';
import { UNIT_OPTIONS } from '@shared/constants/units';
import type { IngredientUnit } from '@domain/entities/Recipe';
import { theme } from '@shared/theme/theme';

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
  const current = UNIT_OPTIONS.find((o) => o.value === value) ?? UNIT_OPTIONS[0]!;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={{
          minHeight: theme.minTouchTarget,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.lg,
          justifyContent: 'center',
        }}
      >
        <Text className="text-base text-text text-right">{current.label}</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <View
            className="bg-surface rounded-t-2xl"
            style={{
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
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
                    justifyContent: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Text
                    className={`text-lg text-right ${
                      item.value === value ? 'text-accent font-bold' : 'text-text'
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
});
