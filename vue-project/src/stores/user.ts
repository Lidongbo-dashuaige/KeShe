import { ref } from 'vue';

interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
}

const user = ref<User | null>(null);
const token = ref<string | null>(null);

console.log('Initializing user store, current user:', user.value);

function loadUserFromStorage() {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  console.log('Loading user from storage:', storedUser);
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      user.value = parsed;
      console.log('User loaded from storage:', user.value);
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
  if (storedToken) {
    token.value = storedToken;
    console.log('Token loaded from storage:', storedToken);
  }
}

loadUserFromStorage();

export function useUserStore() {
  function setUser(newUser: User, newToken: string) {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', newToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  function updateUser(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates };
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  function getToken() {
    return token.value;
  }

  return {
    user,
    token,
    isLoggedIn: () => !!user.value && !!token.value,
    setUser,
    logout,
    updateUser,
    getToken
  };
}
