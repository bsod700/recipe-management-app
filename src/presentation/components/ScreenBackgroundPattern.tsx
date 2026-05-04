import React, { memo } from 'react';
import { Image } from 'react-native';
import { figmaAssets } from '@presentation/assets/figmaAssets';

function ScreenBackgroundPatternInner(): React.ReactElement {
  return (
    <Image
      source={figmaAssets.patternBg}
      style={{ position: 'absolute', inset: 0, opacity: 0.2 }}
      resizeMode="repeat"
    />
  );
}

export const ScreenBackgroundPattern = memo(ScreenBackgroundPatternInner);
