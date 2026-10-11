import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  count: number;
  canDraw: boolean;
  onDraw: () => void;
}

export const DrawPile: React.FC<Props> = ({ count, canDraw, onDraw }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!canDraw}
      onPress={onDraw}
      style={[styles.container, canDraw && styles.canDrawGlow]}
    >
      {/* 3D stacked deck shadow layers */}
      <View style={[styles.deckLayer, styles.deckLayer2]} />
      <View style={[styles.deckLayer, styles.deckLayer1]} />

      {/* Top Deck Card (Authentic UNO Card Back) */}
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          {/* Tilted Iconic Red Oval */}
          <View style={styles.centerOval}>
            <Text style={styles.unoText}>UNO</Text>
          </View>
          {/* Card counter badge */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
      </View>

      {canDraw && (
        <View style={styles.drawPrompt}>
          <Text style={styles.drawPromptText}>TAP TO DRAW</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
    width: 68,
    height: 100,
  },
  canDrawGlow: {
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  deckLayer: {
    position: 'absolute',
    width: 68,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  deckLayer2: {
    top: 4,
    left: 4,
    backgroundColor: '#E0E0E0',
  },
  deckLayer1: {
    top: 2,
    left: 2,
    backgroundColor: '#F0F0F0',
  },
  cardOuter: {
    width: 68,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerOval: {
    width: '80%',
    height: '64%',
    backgroundColor: '#EA2027',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-26deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  unoText: {
    color: '#FFD700',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 18,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  countBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  countText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
  },
  drawPrompt: {
    position: 'absolute',
    bottom: -22,
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  drawPromptText: {
    color: '#080808',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
