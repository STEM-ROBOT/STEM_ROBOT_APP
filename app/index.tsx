import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import tokenService from '@/config/tokenservice';

const Index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await tokenService.getToken();
        console.log(token)
        if (token) {
          router.replace('/home'); 
        } else {
          router.replace('/login'); 
        }
      } catch (error) {
        console.error('Error checking token:', error);
        router.replace('/login'); 
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  if (loading) {
   
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* <ActivityIndicator size="large" /> */}
        {/* <Text>Loading...</Text> */}
      </View>
    );
  }

  return null;
};

export default Index;
