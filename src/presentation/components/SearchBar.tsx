import React, { memo } from 'react';
import { Search, X } from 'lucide-react-native';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';

interface Props {
  readonly value: string;
  readonly onChange: (v: string) => void;
}

function SearchBarInner({ value, onChange }: Props): React.ReactElement {
  return (
    <Input
      variant="outline"
      size="lg"
      className="bg-secondary-500 border-outline-500 rounded-lg"
      style={{ minHeight: theme.minTouchTarget }}
    >
      {value.length > 0 ? (
        <InputSlot
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.clearSearch}
          style={{ minWidth: theme.minTouchTarget, minHeight: theme.minTouchTarget }}
        >
          <InputIcon as={X} className="text-typography-500" />
        </InputSlot>
      ) : null}
      <InputField
        value={value}
        onChangeText={onChange}
        placeholder={strings.screens.list.searchPlaceholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        accessibilityLabel={strings.a11y.searchField}
        className="text-typography-950"
        style={{ fontSize: theme.fontBase }}
        returnKeyType="search"
        autoCorrect={false}
      />
      <InputSlot style={{ minWidth: theme.minTouchTarget, minHeight: theme.minTouchTarget }}>
        <InputIcon as={Search} className="text-typography-500" />
      </InputSlot>
    </Input>
  );
}

export const SearchBar = memo(SearchBarInner);
