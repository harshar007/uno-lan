import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  serverUrl?: string;
}

export const ConnectionBadge: React.FC<Props> = ({ status, serverUrl }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return COLORS.success;
      case 'connecting':
        return COLORS.warning;
      case 'error':
      case 'disconnected':
        return COLORS.error;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'LAN CONNECTED';
      case 'connecting':
        return 'CONNECTING...';
      case 'error':
        return 'CONNECTION ERROR';
      case 'disconnected':
        return 'OFFLINE';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
      {serverUrl && <Text style={styles.url}>({serverUrl.replace(/^http:\/\//, '')})</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  url: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
});
