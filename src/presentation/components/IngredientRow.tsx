import React, { memo, useCallback } from 'react';
import { X } from 'lucide-react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { RecipeFormValues } from '@domain/schemas/recipeSchema';
import { TextField } from './TextField';
import { UnitPicker } from './UnitPicker';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';

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
    <Box
      className="rounded-lg border border-outline-500 bg-secondary-500"
      style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
    >
      {/* Row: name field + remove button (RTL row reverse) */}
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <Box style={{ flex: 1 }}>
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
        </Box>

        {canRemove ? (
          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.removeIngredientRow}
            className="rounded-md bg-background-0"
            style={{
              minWidth: theme.minTouchTarget,
              minHeight: theme.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon as={X} size="lg" className="text-error-500" />
          </Pressable>
        ) : null}
      </Box>

      {/* Amount + unit (RTL) */}
      <Box
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
        }}
      >
        <Box style={{ flex: 1 }}>
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
        </Box>

        <Box style={{ flex: 1 }}>
          <Controller
            control={control}
            name={`ingredients.${index}.unit`}
            render={({ field }) => (
              <UnitPicker value={field.value} onChange={field.onChange} />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}

export const IngredientRow = memo(IngredientRowInner);
