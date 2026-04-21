import { forwardRef } from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { theme } from '@shared/theme/theme';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
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
    <Box className="w-full">
      {label ? (
        <Text className="mb-2 text-base font-semibold text-typography-950 text-right">
          {label}
        </Text>
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
            textAlign="right"
            textAlignVertical="top"
            className="text-right text-typography-950"
            style={{ writingDirection: 'rtl' }}
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
            textAlign="right"
            textAlignVertical="center"
            className="text-right text-typography-950"
            style={{ writingDirection: 'rtl', fontSize: theme.fontBase }}
            {...rest}
          />
        </Input>
      )}
      {error ? (
        <Text className="mt-1 text-base text-error-500 text-right">{error}</Text>
      ) : null}
    </Box>
  );
});
