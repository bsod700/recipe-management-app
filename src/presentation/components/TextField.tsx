import { forwardRef } from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { theme } from '@shared/theme/theme';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

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
  void ref;
  const hasError = Boolean(error);
  return (
    <FormControl className="w-full" isInvalid={hasError}>
      {label ? (
        <FormControlLabel className="justify-end mb-2" style={{ direction: 'ltr'}}>
          <FormControlLabelText className="text-base font-semibold text-typography-950">
            {label}
          </FormControlLabelText>
        </FormControlLabel>
      ) : null}
      {multiline ? (
        <Textarea
          size="md"
          isInvalid={hasError}
          className="bg-secondary-500 border-outline-500 rounded-lg"
          style={{ minHeight: minHeight ?? 120 }}
        >
          <TextareaInput
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.accent}
            textAlignVertical="top"
            className="text-typography-950"
            {...rest}
          />
        </Textarea>
      ) : (
        <Input
          size="lg"
          variant="outline"
          isInvalid={hasError}
          className="bg-secondary-500 border-outline-500 rounded-lg"
          style={{ minHeight: minHeight ?? theme.minTouchTarget }}
        >
          <InputField
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.accent}
            textAlignVertical="center"
            className="text-typography-950"
            style={{ fontSize: theme.fontBase }}
            {...rest}
          />
        </Input>
      )}
      {error ? (
        <FormControlError className="justify-end mt-1">
          <FormControlErrorText className="text-base">
            {error}
          </FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
});
