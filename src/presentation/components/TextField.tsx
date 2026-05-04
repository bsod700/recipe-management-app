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
          className="rounded-lg"
          style={{
            minHeight: minHeight ?? 120,
            backgroundColor: 'rgba(224,207,191,0.25)',
            borderColor: 'rgba(99,48,19,0.1)',
          }}
        >
          <TextareaInput
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.accent}
            textAlignVertical="top"
            style={{ color: theme.colors.text }}
            {...rest}
          />
        </Textarea>
      ) : (
        <Input
          size="lg"
          variant="outline"
          isInvalid={hasError}
          className="rounded-lg"
          style={{
            minHeight: minHeight ?? theme.minTouchTarget,
            backgroundColor: 'rgba(224,207,191,0.25)',
            borderColor: 'rgba(99,48,19,0.1)',
          }}
        >
          <InputField
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.accent}
            textAlignVertical="center"
            style={{ fontSize: theme.fontBase, color: theme.colors.text }}
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
