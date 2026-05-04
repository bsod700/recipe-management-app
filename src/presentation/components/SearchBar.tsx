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
      className="rounded-lg"
      style={{
        minHeight: theme.minTouchTarget,
        backgroundColor: 'rgba(224,207,191,0.25)',
        borderColor: 'rgba(99,48,19,0.1)',
      }}
    >
      {value.length > 0 ? (
        <InputSlot
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.clearSearch}
          style={{ minWidth: theme.minTouchTarget, minHeight: theme.minTouchTarget }}
        >
          <InputIcon as={X} style={{ color: theme.colors.textMuted }} />
        </InputSlot>
      ) : null}
      <InputField
        value={value}
        onChangeText={onChange}
        placeholder={strings.screens.list.searchPlaceholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        accessibilityLabel={strings.a11y.searchField}
        style={{ fontSize: theme.fontBase, color: theme.colors.text }}
        returnKeyType="search"
        autoCorrect={false}
      />
      <InputSlot style={{ minWidth: theme.minTouchTarget, minHeight: theme.minTouchTarget }}>
        <InputIcon as={Search} style={{ color: theme.colors.textMuted }} />
      </InputSlot>
    </Input>
  );
}

export const SearchBar = memo(SearchBarInner);
