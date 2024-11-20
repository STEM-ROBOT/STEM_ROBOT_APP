import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../config/config';
import tokenService from '../config/tokenservice'
import { Stack } from 'expo-router';

export default function Login() {
  const navigation = useNavigation();

  // State to store user input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {

      const response = await api.post('/api/auth/login', { email, password });
      const token = response?.data?.result?.token;
      await tokenService.saveToken(token);
      navigation.navigate('(tabs)' as never);
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password");
      console.error("Login error:", error);
    }
  };

  return (
    <> 
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    />
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>Sign in</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor="#8a8a8a"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#8a8a8a"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
        </View>

        <Text style={styles.orText}>Contact for :</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={24} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={24} color="#db4a39" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 170,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    color: '#000',
    backgroundColor: '#f8f8f8',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signInButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6b38fb',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  signUpText: {
    color: '#8a8a8a',
  },
  orText: {
    color: '#8a8a8a',
    marginVertical: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  socialButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f8f8',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});
