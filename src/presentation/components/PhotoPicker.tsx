import React, { memo, useCallback } from 'react';
import { Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Trash2 } from 'lucide-react-native';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { persistImage } from '@shared/utils/images';
import { Button } from './Button';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  return (
    <Box style={{ gap: theme.spacing.md }}>
      <Text className="text-base text-typography-950 font-semibold text-right">
        {strings.screens.edit.fields.photo}
      </Text>

      {uri ? (
        <Box
          className="rounded-lg overflow-hidden bg-secondary-500 border border-outline-500"
        >
          <Image
            source={{ uri }}
            accessibilityLabel={strings.a11y.recipeImage}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </Box>
      ) : null}

      <Box style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Box style={{ flex: 1 }}>
          <Button
            label={strings.screens.edit.actions.pickPhoto}
            onPress={pick}
            variant="secondary"
            icon={ImagePlus}
          />
        </Box>
        {uri ? (
          <Box style={{ flex: 1 }}>
            <Button
              label={strings.screens.edit.actions.removePhoto}
              onPress={remove}
              variant="danger"
              icon={Trash2}
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

export const PhotoPicker = memo(PhotoPickerInner);
