import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo';
import { GoldenButton } from '../src/components/GoldenButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { GameModeCard } from '../src/components/GameModeCard';
import { PlayerLimitSelector } from '../src/components/PlayerLimitSelector';
import { ErrorMessage } from '../src/components/ErrorMessage';
import { useGameStore } from '../src/store/game-store';
import { COLORS } from '../src/theme/colors';

export default function CreateRoomScreen() {
  const router = useRouter();
  const {
    createRoom,
    errorMessage,
    clearError,
    playerName,
    setPlayerName,
    serverUrl,
    setServerUrl,
    startHotspotHost,
  } = useGameStore();

  const [hostMode, setHostMode] = useState<'hotspot' | 'lan'>('hotspot');
  const [name, setName] = useState(playerName || 'Host Player');
  const [hostAddress, setHostAddress] = useState(serverUrl);
  const [mode, setMode] = useState<'classic' | 'reverse'>('classic');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    clearError();

    if (hostMode === 'hotspot') {
      // 1. Start embedded phone server on 0.0.0.0:3000
      const serverStarted = await startHotspotHost();
      if (!serverStarted) {
        setLoading(false);
        return;
      }
      // Target local loopback TCP socket for the phone running the server
      setServerUrl('tcp://127.0.0.1:3000');
    } else {
      if (hostAddress.trim() && hostAddress.trim() !== serverUrl) {
        setServerUrl(hostAddress.trim());
      }
    }

    setPlayerName(name.trim());

    const success = await createRoom(
      name.trim(),
      maxPlayers,
      mode,
      password.trim() || undefined
    );
    setLoading(false);

    if (success) {
      router.push('/lobby');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StackUnoLogo size="small" />

        <Text style={styles.screenTitle}>CREATE MULTIPLAYER ROOM</Text>

        <ErrorMessage message={errorMessage} onDismiss={clearError} />

        {/* Host Method Selector: Hotspot Phone Host vs External LAN PC */}
        <View style={styles.hostModeSelector}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.hostModeTab, hostMode === 'hotspot' && styles.hostModeTabActive]}
            onPress={() => setHostMode('hotspot')}
          >
            <Text style={[styles.hostModeTabTitle, hostMode === 'hotspot' && styles.hostModeTabTitleActive]}>
              📱 PHONE HOTSPOT (NO PC)
            </Text>
            <Text style={styles.hostModeTabSub}>This phone hosts the server directly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.hostModeTab, hostMode === 'lan' && styles.hostModeTabActive]}
            onPress={() => setHostMode('lan')}
          >
            <Text style={[styles.hostModeTabTitle, hostMode === 'lan' && styles.hostModeTabTitleActive]}>
              💻 COMPUTER LAN SERVER
            </Text>
            <Text style={styles.hostModeTabSub}>Connects to PC 'npm run server'</Text>
          </TouchableOpacity>
        </View>

        {/* Hotspot Instructions Card */}
        {hostMode === 'hotspot' && (
          <View style={styles.hotspotBanner}>
            <Text style={styles.hotspotBannerTitle}>⚡ 100% OFFLINE HOTSPOT MULTIPLAYER</Text>
            <Text style={styles.hotspotBannerText}>
              1. Turn ON your phone's <Text style={styles.boldText}>Personal Hotspot</Text> (mobile data can be OFF).
            </Text>
            <Text style={styles.hotspotBannerText}>
              2. Have friends connect their phones to your Hotspot Wi-Fi.
            </Text>
            <Text style={styles.hotspotBannerText}>
              3. When they open STACK UNO, they tap <Text style={styles.boldText}>"JOIN HOTSPOT (192.168.43.1)"</Text>!
            </Text>
          </View>
        )}

        {/* Player Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>YOUR DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            maxLength={20}
          />
        </View>

        {/* Server IP / LAN Address (Only if PC LAN is selected) */}
        {hostMode === 'lan' && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>MULTIPLAYER SERVER ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={hostAddress}
              onChangeText={setHostAddress}
              placeholder="http://192.168.1.x:3000"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              Host computer address. Run 'npm run server' in terminal.
            </Text>
          </View>
        )}

        {/* Game Mode */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>GAME MODE</Text>
          <GameModeCard
            mode="classic"
            isSelected={mode === 'classic'}
            onSelect={() => setMode('classic')}
          />
          <GameModeCard
            mode="reverse"
            isSelected={mode === 'reverse'}
            onSelect={() => setMode('reverse')}
          />
        </View>

        {/* Player Limit */}
        <PlayerLimitSelector
          selectedLimit={maxPlayers}
          onSelectLimit={setMaxPlayers}
        />

        {/* Optional Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ROOM PASSWORD (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Leave empty for public"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            maxLength={15}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GoldenButton
            title={hostMode === 'hotspot' ? "HOST ON HOTSPOT & ENTER LOBBY" : "CREATE & ENTER LOBBY"}
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim()}
          />
          <SecondaryButton
            title="BACK"
            onPress={() => router.back()}
          />
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
  screenTitle: {
    color: COLORS.primaryGold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  hostModeSelector: {
    gap: 10,
    marginBottom: 16,
  },
  hostModeTab: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 14,
    padding: 14,
  },
  hostModeTabActive: {
    borderColor: COLORS.primaryGold,
    backgroundColor: '#1E180A',
  },
  hostModeTabTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hostModeTabTitleActive: {
    color: COLORS.primaryGold,
  },
  hostModeTabSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  hotspotBanner: {
    backgroundColor: '#161408',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.metallicGold,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  hotspotBannerTitle: {
    color: COLORS.primaryGold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  hotspotBannerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  boldText: {
    color: COLORS.primaryGold,
    fontWeight: '700',
  },
  fieldGroup: {
    marginVertical: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  actions: {
    marginTop: 22,
    gap: 12,
  },
});
