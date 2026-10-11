import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create-room" />
        <Stack.Screen name="join-room" />
        <Stack.Screen name="lobby" />
        <Stack.Screen name="game/[roomId]" />
        <Stack.Screen name="results" />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}
