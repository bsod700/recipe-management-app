import React, { memo, useCallback } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { RecipeFormValues } from '@domain/schemas/recipeSchema';
import { TextField } from './TextField';
import { UnitPicker } from './UnitPicker';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly index: number;
  readonly canRemove: boolean;
  readonly onRemove: (index: number) => void;
}

function IngredientRowInner({
  index,
  canRemove,
  onRemove,
}: Props): React.ReactElement {
  const { control, formState } = useFormContext<RecipeFormValues>();
  const errors = formState.errors.ingredients?.[index];
  const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);

  return (
    <View
      className="rounded-card border border-border bg-surfaceAlt"
      style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
    >
      {/* Row: name field + remove button (RTL row reverse) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name={`ingredients.${index}.name`}
            render={({ field }) => (
              <TextField
                placeholder={strings.screens.edit.fields.ingredientName}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors?.name?.message}
                autoCorrect={false}
                returnKeyType="next"
              />
            )}
          />
        </View>

        {canRemove ? (
          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.removeIngredientRow}
            style={{
              minWidth: theme.minTouchTarget,
              minHeight: theme.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.md,
            }}
          >
            <Text className="text-2xl text-danger font-bold">×</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Amount + unit (RTL) */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name={`ingredients.${index}.amount`}
            render={({ field }) => (
              <TextField
                placeholder={strings.screens.edit.fields.ingredientAmount}
                value={
                  field.value === undefined || Number.isNaN(field.value)
                    ? ''
                    : String(field.value)
                }
                onChangeText={(text) => {
                  const normalized = text.replace(',', '.').replace(/[^0-9.]/g, '');
                  field.onChange(normalized === '' ? NaN : Number(normalized));
                }}
                onBlur={field.onBlur}
                error={errors?.amount?.message}
                keyboardType="decimal-pad"
                inputMode="decimal"
                returnKeyType="next"
              />
            )}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name={`ingredients.${index}.unit`}
            render={({ field }) => (
              <UnitPicker value={field.value} onChange={field.onChange} />
            )}
          />
        </View>
      </View>
    </View>
  );
}

export const IngredientRow = memo(IngredientRowInner);
