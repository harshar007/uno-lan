import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { StackUnoLogo } from '../src/components/StackUnoLogo';
import { GoldenButton } from '../src/components/GoldenButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { ConnectionBadge } from '../src/components/ConnectionBadge';
import { GameModeCard } from '../src/components/GameModeCard';
import { CinematicSplash } from '../src/components/SplashScreen';
import { useGameStore } from '../src/store/game-store';
import { colors } from '../src/theme/colors';
import { haptic } from '../src/services/haptics';
import { GameCard } from '../src/components/GameCard';

export default function HomeScreen() {
  const router = useRouter();
  const { connectionStatus, serverUrl, startLocalGame } = useGameStore();

  const [showSplash, setShowSplash] = useState(true);
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<'classic' | 'reverse'>('classic');
  const [localPlayerCount, setLocalPlayerCount] = useState<number>(4);

  // Entrance animations for menu
  const menuOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(20);

  // Floating decorative card animation
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Floating decorative animation in background
    floatY.value = withRepeat(
      withTiming(-12, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [floatY]);

  const handleSplashFinish = () => {
    setShowSplash(false);
    menuOpacity.value = withTiming(1, { duration: 350 });
    menuTranslateY.value = withTiming(0, { duration: 350 });
  };

  const handleStartLocalMatch = async () => {
    await haptic.mediumImpact();
    startLocalGame({
      mode: selectedPreviewMode,
      playerCount: localPlayerCount,
    });
    router.push('/game/LOCAL');
  };

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ translateY: menuTranslateY.value }],
  }));

  const floatCard1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { rotate: '-18deg' }],
  }));

  const floatCard2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: -floatY.value }, { rotate: '22deg' }],
  }));

  if (showSplash) {
    return <CinematicSplash onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative background realistic floating cards */}
      <Animated.View pointerEvents="none" style={[styles.bgCard, styles.bgCardLeft, floatCard1Style]}>
        <GameCard
          card={{ id: 'bg1', color: 'red', type: 'number', value: 7 }}
          size="medium"
          disabled
        />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.bgCard, styles.bgCardRight, floatCard2Style]}>
        <GameCard
          card={{ id: 'bg2', color: 'yellow', type: 'reverse' }}
          size="medium"
          disabled
        />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.header}>
          <ConnectionBadge status={connectionStatus} serverUrl={serverUrl} isLocal={true} />
        </View>

        {/* Hero Branding */}
        <View style={styles.logoSection}>
          <StackUnoLogo size="large" />
        </View>

        {/* Staggered Animated Main Menu */}
        <Animated.View style={[styles.menuWrapper, menuAnimatedStyle]}>
          {/* Instant Local Play Section */}
          <View style={styles.instantPlayCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardBadge}>OFFLINE & INSTANT</Text>
              <Text style={styles.cardSub}>Runs 100% on this phone</Text>
            </View>

            <Text style={styles.instantPlayTitle}>SOLO MATCH (VS AI BOTS)</Text>

            {/* Player count selector for local game */}
            <View style={styles.playerCountRow}>
              <Text style={styles.playerCountLabel}>PLAYERS:</Text>
              <View style={styles.playerCountPills}>
                {[2, 3, 4].map((count) => (
                  <TouchableOpacity
                    key={count}
                    activeOpacity={0.7}
                    style={[
                      styles.playerCountPill,
                      localPlayerCount === count && styles.playerCountPillActive,
                    ]}
                    onPress={() => setLocalPlayerCount(count)}
                  >
                    <Text
                      style={[
                        styles.playerCountPillText,
                        localPlayerCount === count && styles.playerCountPillTextActive,
                      ]}
                    >
                      {count}P
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <GoldenButton
              title="START MATCH NOW"
              onPress={handleStartLocalMatch}
            />
          </View>

          {/* Game Modes Selector */}
          <View style={styles.modesSection}>
            <Text style={styles.sectionTitle}>RULES & GAME MODE</Text>
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

          {/* LAN Multiplayer Section */}
          <View style={styles.lanSection}>
            <Text style={styles.sectionTitle}>LOCAL WI-FI MULTIPLAYER</Text>
            <View style={styles.lanActions}>
              <SecondaryButton
                title="CREATE LAN ROOM"
                onPress={() => router.push('/create-room')}
              />
              <SecondaryButton
                title="JOIN LAN ROOM"
                onPress={() => router.push('/join-room')}
              />
              <SecondaryButton
                title="SETTINGS & LAN IP"
                onPress={() => router.push('/settings')}
              />
            </View>
          </View>

          {/* Footer info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>STACK UNO • Local Standalone & LAN Real-Time</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  bgCard: {
    position: 'absolute',
    opacity: 0.12,
    zIndex: 0,
  },
  bgCardLeft: {
    top: 140,
    left: -10,
  },
  bgCardRight: {
    top: 220,
    right: -10,
  },
  header: {
    marginTop: 10,
    marginBottom: 6,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 14,
    zIndex: 1,
  },
  menuWrapper: {
    zIndex: 1,
  },
  instantPlayCard: {
    backgroundColor: '#151208',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.goldMetallic,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBadge: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 10,
  },
  instantPlayTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  playerCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  playerCountLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  playerCountPills: {
    flexDirection: 'row',
    gap: 8,
  },
  playerCountPill: {
    backgroundColor: '#202020',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  playerCountPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  playerCountPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  playerCountPillTextActive: {
    color: '#080808',
    fontWeight: '900',
  },
  modesSection: {
    marginTop: 8,
    marginBottom: 14,
  },
  lanSection: {
    marginTop: 10,
  },
  lanActions: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
