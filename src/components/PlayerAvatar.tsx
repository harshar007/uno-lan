import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors.js';

interface Props {
  name: string;
  isHost?: boolean;
  isConnected?: boolean;
  hasDeclaredUno?: boolean;
  size?: number;
}

export const PlayerAvatar: React.FC<Props> = ({
  name,
  isHost = false,
  isConnected = true,
  hasDeclaredUno = false,
  size = 44,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials || '?'}</Text>

      {/* Host Crown */}
      {isHost && (
        <View style={styles.hostBadge}>
          <Text style={styles.hostIcon}>👑</Text>
        </View>
      )}

      {/* Connection Indicator */}
      <View
        style={[
          styles.connectionDot,
          { backgroundColor: isConnected ? COLORS.success : COLORS.error },
        ]}
      />

      {/* UNO Badge */}
      {hasDeclaredUno && (
        <View style={styles.unoBadge}>
          <Text style={styles.unoText}>1</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: COLORS.metallicGold,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  initials: {
    color: COLORS.primaryGold,
    fontWeight: '800',
  },
  hostBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
  hostIcon: {
    fontSize: 12,
  },
  connectionDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  unoBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.brightYellow,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  unoText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
});
