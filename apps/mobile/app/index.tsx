import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { StackUnoLogo } from '../src/components/StackUnoLogo.js';
import { GoldenButton } from '../src/components/GoldenButton.js';
import { SecondaryButton } from '../src/components/SecondaryButton.js';
import { ConnectionBadge } from '../src/components/ConnectionBadge.js';
import { GameModeCard } from '../src/components/GameModeCard.js';
import { CinematicSplash } from '../src/components/SplashScreen.js';
import { useGameStore } from '../src/store/game-store.js';
import { colors } from '../src/theme/colors.js';

export default function HomeScreen() {
  const router = useRouter();
  const { connectionStatus, serverUrl, connectSocket } = useGameStore();

  const [showSplash, setShowSplash] = useState(true);
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<'classic' | 'reverse'>('classic');

  // Entrance animations for menu
  const menuOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(20);

  // Floating decorative card animation
  const floatY = useSharedValue(0);

  useEffect(() => {
    connectSocket();

    // Floating decorative animation in background
    floatY.value = withRepeat(
      withTiming(-12, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [connectSocket, floatY]);

  const handleSplashFinish = () => {
    setShowSplash(false);
    menuOpacity.value = withTiming(1, { duration: 350 });
    menuTranslateY.value = withTiming(0, { duration: 350 });
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
      {/* Decorative background floating cards */}
      <Animated.View style={[styles.bgCard, styles.bgCardLeft, floatCard1Style]}>
        <View style={[styles.bgCardInner, { backgroundColor: colors.cardRed }]}>
          <Text style={styles.bgCardText}>7</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.bgCard, styles.bgCardRight, floatCard2Style]}>
        <View style={[styles.bgCardInner, { backgroundColor: colors.cardYellow }]}>
          <Text style={[styles.bgCardText, { color: '#080808' }]}>⇄</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Connection status header */}
        <View style={styles.header}>
          <ConnectionBadge status={connectionStatus} serverUrl={serverUrl} />
        </View>

        {/* Hero Branding */}
        <View style={styles.logoSection}>
          <StackUnoLogo size="large" />
        </View>

        {/* Staggered Animated Main Menu */}
        <Animated.View style={[styles.menuWrapper, menuAnimatedStyle]}>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bgCard: {
    position: 'absolute',
    opacity: 0.12,
    zIndex: 0,
  },
  bgCardLeft: {
    top: 140,
    left: -15,
  },
  bgCardRight: {
    top: 220,
    right: -15,
  },
  bgCardInner: {
    width: 80,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCardText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 36,
  },
  header: {
    marginTop: 12,
    marginBottom: 8,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 18,
    zIndex: 1,
  },
  menuWrapper: {
    zIndex: 1,
  },
  actionSection: {
    gap: 14,
    marginVertical: 16,
  },
  modesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  footer: {
    marginTop: 26,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
