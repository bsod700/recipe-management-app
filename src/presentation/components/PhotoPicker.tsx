import React, { memo, useCallback } from 'react';
import { Alert, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Trash2 } from 'lucide-react-native';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { persistImage } from '@shared/utils/images';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from './Button';

interface Props {
  readonly uri: string | undefined;
  readonly onChange: (uri: string | undefined) => void;
}

function PhotoPickerInner({ uri, onChange }: Props): React.ReactElement {
  const pick = useCallback(async (): Promise<void> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(strings.app.name, strings.errors.imagePickerDenied);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    const persistedUri = await persistImage(asset.uri);
    onChange(persistedUri);
  }, [onChange]);

  const remove = useCallback(() => onChange(undefined), [onChange]);

  if (uri) {
    return (
      <View style={{ gap: 8 }}>
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <Image
            source={{ uri }}
            accessibilityLabel={strings.a11y.recipeImage}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </View>
        <Button label={strings.screens.edit.actions.removePhoto} onPress={remove} variant="danger" icon={Trash2} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={pick}
      accessibilityRole="button"
      style={{
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: 'rgba(99,48,19,0.25)',
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(224,207,191,0.10)',
      }}
    >
      <Icon as={ImagePlus} size="xl" style={{ color: theme.colors.textMuted }} />
      <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>
        {strings.screens.edit.actions.pickPhoto}
      </Text>
    </Pressable>
  );
}

export const PhotoPicker = memo(PhotoPickerInner);
