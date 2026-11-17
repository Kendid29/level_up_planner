// Level Up Planner: Root Layout
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../context/AppContext';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.cream },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="calendar"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="profile"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="goals/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="goals/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="goals/[id]/edit"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="goals/[id]/milestone-new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="tasks/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="tasks/[id]/edit"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="habits/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="habits/[id]/edit"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="notes/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="notes/[id]/edit"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="journal/new"
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="journal/[id]/edit"
            options={{ headerShown: false, presentation: 'modal' }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
