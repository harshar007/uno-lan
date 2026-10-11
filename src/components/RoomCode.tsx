import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../theme/colors.js';
import { haptic } from '../services/haptics.js';

interface Props {
  code: string;
}

export const RoomCode: React.FC<Props> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      await haptic.success();
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleCopy}
      style={styles.container}
    >
      <Text style={styles.label}>ROOM CODE</Text>
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.hint}>{copied ? 'COPIED TO CLIPBOARD!' : 'TAP TO COPY'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.goldMetallic,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  code: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  hint: {
    color: colors.goldSoft,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
});
