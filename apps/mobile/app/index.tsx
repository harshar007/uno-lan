import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo.js';
import { GoldenButton } from '../src/components/GoldenButton.js';
import { SecondaryButton } from '../src/components/SecondaryButton.js';
import { ConnectionBadge } from '../src/components/ConnectionBadge.js';
import { GameModeCard } from '../src/components/GameModeCard.js';
import { useGameStore } from '../src/store/game-store.js';
import { COLORS } from '../src/theme/colors.js';

export default function HomeScreen() {
  const router = useRouter();
  const { connectionStatus, serverUrl, connectSocket } = useGameStore();
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<'classic' | 'reverse'>('classic');

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Connection status header */}
        <View style={styles.header}>
          <ConnectionBadge status={connectionStatus} serverUrl={serverUrl} />
        </View>

        {/* Hero Branding */}
        <View style={styles.logoSection}>
          <StackUnoLogo size="large" />
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionSection}>
          <GoldenButton
            title="CREATE ROOM"
            onPress={() => router.push('/create-room')}
          />
          <SecondaryButton
            title="JOIN ROOM"
            onPress={() => router.push('/join-room')}
          />
          <SecondaryButton
            title="SETTINGS & LAN SETUP"
            onPress={() => router.push('/settings')}
          />
        </View>

        {/* Game Modes Preview */}
        <View style={styles.modesSection}>
          <Text style={styles.sectionTitle}>SELECTABLE GAME MODES</Text>
          <GameModeCard
            mode="classic"
            isSelected={selectedPreviewMode === 'classic'}
            onSelect={() => setSelectedPreviewMode('classic')}
          />
          <GameModeCard
            mode="reverse"
            isSelected={selectedPreviewMode === 'reverse'}
            onSelect={() => setSelectedPreviewMode('reverse')}
          />
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Local Wi-Fi Multiplayer • Up to 10 Players</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 12,
    marginBottom: 8,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  actionSection: {
    gap: 14,
    marginVertical: 16,
  },
  modesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
