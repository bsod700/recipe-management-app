import React, { memo, useCallback } from 'react';
import { View, Image, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { strings } from '@shared/i18n/he';
import { theme } from '@shared/theme/theme';
import { persistImage } from '@shared/utils/images';
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
    <View style={{ gap: theme.spacing.md }}>
      <Text className="text-base text-text font-semibold text-right">
        {strings.screens.edit.fields.photo}
      </Text>

      {uri ? (
        <View
          className="rounded-card overflow-hidden bg-surface"
          style={{ borderColor: theme.colors.border, borderWidth: 1 }}
        >
          <Image
            source={{ uri }}
            accessibilityLabel={strings.a11y.recipeImage}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            label={strings.screens.edit.actions.pickPhoto}
            onPress={pick}
            variant="secondary"
          />
        </View>
        {uri ? (
          <View style={{ flex: 1 }}>
            <Button
              label={strings.screens.edit.actions.removePhoto}
              onPress={remove}
              variant="danger"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const PhotoPicker = memo(PhotoPickerInner);
