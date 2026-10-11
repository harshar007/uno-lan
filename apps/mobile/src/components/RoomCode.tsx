import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors.js';

interface Props {
  code: string;
}

export const RoomCode: React.FC<Props> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
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
      <Text style={styles.hint}>{copied ? 'COPIED!' : 'TAP TO COPY'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: COLORS.metallicGold,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  code: {
    color: COLORS.primaryGold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  hint: {
    color: COLORS.metallicGold,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
});
