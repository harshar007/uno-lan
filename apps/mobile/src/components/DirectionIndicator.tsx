import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TurnDirection, GameMode } from '@stack-uno/game-engine';
import { COLORS } from '../theme/colors.js';

interface Props {
  direction: TurnDirection;
  mode: GameMode;
}

export const DirectionIndicator: React.FC<Props> = ({ direction, mode }) => {
  const isClockwise = direction === 1;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.arrow}>{isClockwise ? '↻' : '↺'}</Text>
        <Text style={styles.label}>
          {isClockwise ? 'CLOCKWISE' : 'COUNTER-CLOCKWISE'}
        </Text>
      </View>
      {mode === 'reverse' && (
        <View style={styles.reverseModeTag}>
          <Text style={styles.reverseText}>REVERSE MODE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#151515',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333333',
  },
  arrow: {
    color: COLORS.primaryGold,
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reverseModeTag: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  reverseText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
