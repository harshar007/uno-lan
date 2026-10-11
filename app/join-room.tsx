import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo';
import { GoldenButton } from '../src/components/GoldenButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { ErrorMessage } from '../src/components/ErrorMessage';
import { useGameStore } from '../src/store/game-store';
import { COLORS } from '../src/theme/colors';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { joinRoom, errorMessage, clearError, playerName, setPlayerName, serverUrl, setServerUrl } =
    useGameStore();

  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState(playerName || 'Player');
  const [hostAddress, setHostAddress] = useState(serverUrl);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomCode.trim() || !name.trim()) return;
    setLoading(true);
    clearError();

    if (hostAddress.trim() !== serverUrl) {
      setServerUrl(hostAddress.trim());
    }
    setPlayerName(name.trim());

    const success = await joinRoom(
      roomCode.trim(),
      name.trim(),
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

        <Text style={styles.screenTitle}>JOIN GAME ROOM</Text>

        <ErrorMessage message={errorMessage} onDismiss={clearError} />

        {/* Room Code */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ENTER ROOM CODE</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={roomCode}
            onChangeText={(text) => setRoomCode(text.toUpperCase())}
            placeholder="e.g. STK92"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

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

        {/* Host IP Address */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>HOST LAN ADDRESS (WI-FI IP)</Text>
          <TextInput
            style={styles.input}
            value={hostAddress}
            onChangeText={setHostAddress}
            placeholder="http://192.168.1.x:3000"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            Enter the host computer's IP shown on their server console.
          </Text>
        </View>

        {/* Optional Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ROOM PASSWORD (IF PROTECTED)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (if any)"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            maxLength={15}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GoldenButton
            title="JOIN ROOM"
            onPress={handleJoin}
            loading={loading}
            disabled={!roomCode.trim() || !name.trim()}
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
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    color: COLORS.primaryGold,
    borderColor: COLORS.metallicGold,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
