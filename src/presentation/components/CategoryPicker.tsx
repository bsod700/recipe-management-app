import React, { memo, useState } from 'react';
import { ChevronDown, Hash } from 'lucide-react-native';
import { FlatList, Modal, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@shared/theme/theme';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from './Button';

interface Props {
  readonly value: string;
  readonly categories: ReadonlyArray<string>;
  readonly onChange: (category: string) => void;
}

function CategoryPickerInner({ value, categories, onChange }: Props): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const insets = useSafeAreaInsets();

  const select = (cat: string) => {
    onChange(cat);
    setOpen(false);
  };

  const addNew = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setDraft('');
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={{
          height: 56,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: 'rgba(224,207,191,0.25)',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          gap: 8,
        }}
      >
        <Icon as={ChevronDown} size="sm" style={{ color: theme.colors.text }} />
        <Text
          style={{
            flex: 1,
            color: value ? theme.colors.text : theme.colors.textMuted,
            fontSize: 16,
          }}
        >
          {value || 'בחרו קטגוריה'}
        </Text>
        <Icon as={Hash} size="sm" style={{ color: theme.colors.text }} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              paddingBottom: insets.bottom + 16,
              gap: 12,
            }}
          >
            {categories.length > 0 ? (
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                style={{ maxHeight: 220 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => select(item)}
                    style={{
                      minHeight: 48,
                      justifyContent: 'center',
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                      paddingHorizontal: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: item === value ? theme.colors.accent : theme.colors.text,
                        fontWeight: item === value ? '700' : '400',
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            ) : null}

            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="הוסיפו קטגוריה חדשה"
              placeholderTextColor={theme.colors.textMuted}
              style={{
                height: 56,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: 'rgba(224,207,191,0.25)',
                paddingHorizontal: 24,
                color: theme.colors.text,
                fontSize: 16,
                textAlign: 'right',
              }}
              onSubmitEditing={addNew}
              returnKeyType="done"
            />

            <Button label="הוסיפו" onPress={addNew} />
          </View>
        </View>
      </Modal>
    </>
  );
}

export const CategoryPicker = memo(CategoryPickerInner);
