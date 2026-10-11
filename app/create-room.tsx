import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
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
  } = useGameStore();

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

    if (hostAddress.trim() && hostAddress.trim() !== serverUrl) {
      setServerUrl(hostAddress.trim());
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

        <Text style={styles.screenTitle}>CREATE LAN ROOM</Text>

        <ErrorMessage message={errorMessage} onDismiss={clearError} />

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

        {/* Server IP / LAN Address */}
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
            title="CREATE & ENTER LOBBY"
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
