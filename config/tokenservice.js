import * as SecureStore from 'expo-secure-store';

// Save token securely
const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync('accessToken', token);
  } catch (error) {
    console.error("Error saving token", error);
  }
};

// Get token securely
const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  } catch (error) {
    console.error("Error retrieving token", error);
    return null;
  }
};

// Remove token securely
const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
  } catch (error) {
    console.error("Error removing token", error);
  }
};

const tokenService = {
  saveToken,
  getToken,
  removeToken
};

export default tokenService;
