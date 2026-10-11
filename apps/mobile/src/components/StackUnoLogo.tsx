import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors.js';

interface Props {
  size?: 'small' | 'medium' | 'large';
}

export const StackUnoLogo: React.FC<Props> = ({ size = 'medium' }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const titleFontSize = isLarge ? 42 : isSmall ? 22 : 32;
  const subtitleFontSize = isLarge ? 13 : isSmall ? 9 : 11;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={[styles.brandStack, { fontSize: titleFontSize }]}>STACK</Text>
        <View style={styles.unoTag}>
          <Text style={[styles.brandUno, { fontSize: titleFontSize }]}>UNO</Text>
        </View>
      </View>
      <Text style={[styles.tagline, { fontSize: subtitleFontSize }]}>
        STACK YOUR CARDS. RULE THE GAME.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandStack: {
    fontWeight: '900',
    color: COLORS.primaryGold,
    letterSpacing: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  unoTag: {
    backgroundColor: COLORS.brightYellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    transform: [{ rotate: '-4deg' }],
  },
  brandUno: {
    fontWeight: '900',
    color: '#080808',
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 6,
    fontWeight: '700',
    color: COLORS.metallicGold,
    letterSpacing: 2,
  },
});
