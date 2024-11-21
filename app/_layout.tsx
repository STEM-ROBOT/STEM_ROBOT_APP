import tokenService from '@/config/tokenservice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export type RootStackParamList = {
  "(tabs)": undefined; // No params for (tabs)
  schedule: { id: number }; // Define `id` as a parameter for `schedule`
  match: undefined; // Other routes can also be added here
};

export const unstable_settings = {
  initialRouteName: 'login', // Set default route to login
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userHasAccess, setUserHasAccess] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await tokenService.getToken();
        setIsAuthenticated(!!token); // Set auth status based on token presence

        // Example logic to check access based on token
        const hasAccess = token && token.includes("access_schedule_match");
        setUserHasAccess(!!hasAccess);
      } catch (e) {
        console.error("Error checking token:", e);
        setIsAuthenticated(false);
        setUserHasAccess(false);
      }
    };

    checkToken(); // Run token check on mount
  }, []);

  // Handle any font loading errors
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide the splash screen once fonts are loaded and the token check is complete
  useEffect(() => {
    if (loaded && isAuthenticated !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthenticated]);

  // Wait until fonts are loaded and token check is complete
  if (!loaded || isAuthenticated === null) {
    return null;
  }

  return <RootLayoutNav isAuthenticated={isAuthenticated} userHasAccess={userHasAccess} />;
}

function RootLayoutNav({
  isAuthenticated,
  userHasAccess,
}: {
  isAuthenticated: boolean;
  userHasAccess: boolean;
}) {
  return (
    <Stack>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="home" options={{ headerShown: false,headerBackVisible:false }} />
          {userHasAccess && (
            <>
              {/* <Stack.Screen
                name="schedule"
                options={{ headerShown: true, title: "Weekly Timetable" }}
              /> */}
            </>
          )}
        </>
      ) : (
        <Stack.Screen name="login" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
