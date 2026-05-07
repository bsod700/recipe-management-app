import React, { memo } from 'react';
import { Clock3 } from 'lucide-react-native';
import { TextInput, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { theme } from '@shared/theme/theme';

interface Props {
  readonly value: number;
  readonly onChange: (totalMinutes: number) => void;
  readonly error?: string;
}

function toHM(totalMins: number): { h: number; m: number } {
  if (Number.isNaN(totalMins)) return { h: NaN, m: NaN };
  return { h: Math.floor(totalMins / 60), m: totalMins % 60 };
}

function TimeInputInner({ value, onChange, error }: Props): React.ReactElement {
  const { h, m } = toHM(value);

  const onHoursChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') {
      onChange(Number.isNaN(m) ? NaN : m);
      return;
    }
    const hours = Number(digits);
    const mins = Number.isNaN(m) ? 0 : m;
    onChange(hours * 60 + mins);
  };

  const onMinutesChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') {
      onChange(Number.isNaN(h) ? NaN : h * 60);
      return;
    }
    const mins = Math.min(59, Number(digits));
    const hours = Number.isNaN(h) ? 0 : h;
    onChange(hours * 60 + mins);
  };

  const numberStyle = {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    minWidth: 32,
    padding: 0,
  };

  const borderColor = error ? theme.colors.danger : theme.colors.border;

  return (
    <View>
      <View
        style={{
          height: 56,
          borderRadius: 16,
          borderWidth: 1,
          borderColor,
          backgroundColor: 'rgba(224,207,191,0.25)',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <Icon as={Clock3} size="sm" style={{ color: theme.colors.text }} />

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TextInput
            value={Number.isNaN(h) ? '' : String(h)}
            onChangeText={onHoursChange}
            keyboardType="number-pad"
            style={numberStyle}
            maxLength={2}
            placeholder="00"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>שעות</Text>
        </View>

        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>:</Text>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TextInput
            value={Number.isNaN(m) ? '' : String(m).padStart(2, '0')}
            onChangeText={onMinutesChange}
            keyboardType="number-pad"
            style={numberStyle}
            maxLength={2}
            placeholder="00"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>דקות</Text>
        </View>
      </View>
      {error ? (
        <Text style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}

export const TimeInput = memo(TimeInputInner);
