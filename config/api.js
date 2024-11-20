import api from '../constants/config';

// Example login function
export async function login(email, password) {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { token } = response.data;
    await saveToken(token);
    console.log("Login successful, token saved");
  } catch (error) {
    console.error("Login error:", error);
  }
}

// Example protected API call
async function getProtectedData() {
  try {
    const response = await api.get('/protected-data');
    console.log("Protected data:", response.data);
  } catch (error) {
    console.error("Error fetching protected data:", error);
  }
}
