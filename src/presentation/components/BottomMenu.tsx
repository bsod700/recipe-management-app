import React, { memo } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react-native';
import { View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly onPressHome: () => void;
  readonly onPressSearch: () => void;
  readonly onPressAdd: () => void;
  readonly active: 'home' | 'search';
}

function BottomMenuInner({
  onPressHome,
  onPressSearch,
  onPressAdd,
  active,
}: Props): React.ReactElement {
  return (
    <View
      style={{
        alignSelf: 'center',
        width: 250,
        height: 68,
        borderRadius: 64,
        backgroundColor: theme.colors.menu,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Pressable
        onPress={onPressHome}
        accessibilityRole="button"
        style={{
          width: 48,
          height: 48,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            active === 'home' ? 'rgba(254,253,251,0.15)' : 'rgba(254,253,251,0.05)',
        }}
      >
        <Icon as={BookOpen} size="md" style={{ color: '#FEFDFB' }} />
      </Pressable>

      <Pressable
        onPress={onPressSearch}
        accessibilityRole="button"
        style={{
          width: 48,
          height: 48,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            active === 'search' ? 'rgba(254,253,251,0.15)' : 'rgba(254,253,251,0.05)',
        }}
      >
        <Icon as={Search} size="md" style={{ color: '#FEFDFB' }} />
      </Pressable>

      <Pressable
        onPress={onPressAdd}
        accessibilityRole="button"
        style={{
          position: 'absolute',
          left: '50%',
          marginLeft: -32,
          top: -43,
          width: 82,
          height: 81,
          borderRadius: 50,
          backgroundColor: theme.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#633013',
          shadowOpacity: 0.2,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FEFDFB',
          }}
        >
          <Icon as={Plus} size="xl" style={{ color: theme.colors.accent }} />
        </View>
      </Pressable>
    </View>
  );
}

export const BottomMenu = memo(BottomMenuInner);
