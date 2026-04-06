import { StyleSheet, Text, View } from 'react-native';
import { BinType } from '../api/types';
import { BIN_CONFIG } from '../utils/binColors';

interface BinIconProps {
  binType: BinType;
  size?: number;
}

export function BinIcon({ binType, size = 48 }: BinIconProps) {
  const config = BIN_CONFIG[binType];
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.45 }}>{config.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
