import React, { memo } from 'react';
import { Image, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';
import { figmaAssets } from '@presentation/assets/figmaAssets';

interface Props {
  readonly title: string;
  readonly showMascot: boolean;
}

function HomeHeaderInner({ title, showMascot }: Props): React.ReactElement {
  return (
    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', gap: 16 }}>
      <Text
        style={{
          flex: 1,
          color: theme.colors.text,
          fontSize: 29,
          lineHeight: 36,
          fontWeight: '700',
          textAlign: 'right',
        }}
      >
        {title}
      </Text>
      {showMascot ? (
        <View style={{ width: 60, height: 74, overflow: 'hidden' }}>
          <Image
            source={figmaAssets.homeSmallNib}
            style={{ width: 60, height: 74 }}
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderInner);
