import React, { memo } from 'react';
import { ScrollView, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly categories: ReadonlyArray<string>;
  readonly selectedCategory: string;
  readonly onSelectCategory: (category: string) => void;
}

function CategoryChipsInner({
  categories,
  selectedCategory,
  onSelectCategory,
}: Props): React.ReactElement {
  const allCategories = ['הכל', ...categories];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.sm }}
      style={{ maxHeight: 40, direction: 'rtl' }}
    >
      {allCategories.map((categoryLabel) => {
        const categoryValue = categoryLabel === 'הכל' ? 'all' : categoryLabel;
        const isActive = selectedCategory === categoryValue;
        return (
          <Pressable
            key={categoryValue}
            onPress={() => onSelectCategory(categoryValue)}
            accessibilityRole="button"
            style={{
              borderRadius: 32,
              paddingHorizontal: 16,
              paddingVertical: 4,
              minHeight: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? theme.colors.accent : theme.colors.chip,
            }}
          >
            <Text
              style={{
                color: isActive ? '#FEFDFB' : theme.colors.text,
                fontSize: 16,
                fontWeight: '600',
                letterSpacing: 0.8,
              }}
            >
              {categoryLabel}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: 1 }} />
    </ScrollView>
  );
}

export const CategoryChips = memo(CategoryChipsInner);
