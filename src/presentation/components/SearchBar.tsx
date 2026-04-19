import React, { memo } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly value: string;
  readonly onChange: (v: string) => void;
}

function SearchBarInner({ value, onChange }: Props): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.lg,
        minHeight: theme.minTouchTarget,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={strings.screens.list.searchPlaceholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        accessibilityLabel={strings.a11y.searchField}
        textAlign="right"
        style={{
          flex: 1,
          color: theme.colors.text,
          fontSize: theme.fontBase,
          writingDirection: 'rtl',
        }}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.clearSearch}
          hitSlop={12}
          style={{
            minWidth: theme.minTouchTarget,
            minHeight: theme.minTouchTarget,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="text-xl text-textMuted">×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const SearchBar = memo(SearchBarInner);
