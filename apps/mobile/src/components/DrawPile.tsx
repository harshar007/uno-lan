import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors.js';

interface Props {
  count: number;
  canDraw: boolean;
  onDraw: () => void;
}

export const DrawPile: React.FC<Props> = ({ count, canDraw, onDraw }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!canDraw}
      onPress={onDraw}
      style={[styles.container, canDraw && styles.canDrawGlow]}
    >
      <View style={styles.cardBack}>
        <View style={styles.innerPattern}>
          <Text style={styles.unoLogo}>UNO</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
      {canDraw && (
        <View style={styles.drawPrompt}>
          <Text style={styles.drawPromptText}>DRAW CARD</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  canDrawGlow: {
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  cardBack: {
    width: 66,
    height: 96,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.metallicGold,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerPattern: {
    width: '80%',
    height: '70%',
    backgroundColor: '#0A0A0A',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: COLORS.deepGold,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-20deg' }],
  },
  unoLogo: {
    color: COLORS.primaryGold,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  countBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#000000AA',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  countText: {
    color: COLORS.softGold,
    fontSize: 10,
    fontWeight: '700',
  },
  drawPrompt: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  drawPromptText: {
    color: '#080808',
    fontSize: 9,
    fontWeight: '900',
  },
});
