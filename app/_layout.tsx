import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import tokenService from '@/config/tokenservice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Export ErrorBoundary for handling errors in the layout
export { ErrorBoundary } from 'expo-router';

export type RootStackParamList = {
  home: undefined;
  schedule: { id: number };
  match: { matchId: number };
  login: undefined;
};

// Set the initial route
export const unstable_settings = {
  initialRouteName: 'login', // Ensure login is the initial route
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userHasAccess, setUserHasAccess] = useState<boolean>(false);

  useEffect(() => {
    // Keep the splash screen visible until authentication is resolved
    SplashScreen.preventAutoHideAsync();

    const checkToken = async () => {
      try {
        const token = await tokenService.getToken();
        setIsAuthenticated(!!token);

        // Example: Check if the token grants access
        setUserHasAccess(token?.includes('access_schedule_match') || false);
      } catch (e) {
        console.error('Error checking token:', e);
        setIsAuthenticated(false);
        setUserHasAccess(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isAuthenticated !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthenticated]);

  if (!fontsLoaded || isAuthenticated === null) {
    return null; // Prevent rendering until fonts and authentication are resolved
  }

  return (
    <NavigationContainer>
      <Stack initialRouteName="login">
        {/* Login Screen */}
        {!isAuthenticated && (
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
        )}

        {/* Home Screen */}
        {isAuthenticated && (
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
            }}
          />
        )}

        {/* Schedule Screen */}
        {isAuthenticated && userHasAccess && (
          <Stack.Screen
            name="schedule"
            options={{
              headerShown: true,
              title: 'Schedule',
            }}
          />
        )}

        {/* Match Details Screen */}
        {isAuthenticated && userHasAccess && (
          <Stack.Screen
            name="match"
            options={{
              headerShown: true,
              title: 'Match Details',
            }}
          />
        )}
      </Stack>
    </NavigationContainer>
  );
}
